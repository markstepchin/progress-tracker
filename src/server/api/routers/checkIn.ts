import { z } from "zod";
import exifr from "exifr";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const checkInRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        date: z.coerce.date(),
        weight: z.number().positive().optional(),
        notes: z.string().optional(),
        frontPhotoUrl: z.string().url(),
        sidePhotoUrl: z.string().url(),
        backPhotoUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.checkIn.create({
        data: {
          date: input.date,
          weight: input.weight,
          notes: input.notes,
          frontPhoto: { create: { url: input.frontPhotoUrl } },
          sidePhoto: { create: { url: input.sidePhotoUrl } },
          backPhoto: { create: { url: input.backPhotoUrl } },
        },
        include: {
          frontPhoto: true,
          sidePhoto: true,
          backPhoto: true,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.checkIn.findMany({
      orderBy: { date: "desc" },
      include: {
        frontPhoto: true,
        sidePhoto: true,
        backPhoto: true,
      },
    });
  }),

  getMilestones: publicProcedure.query(async ({ ctx }) => {
    const checkIns = await ctx.db.checkIn.findMany({
      orderBy: { date: "asc" },
      include: {
        frontPhoto: true,
        sidePhoto: true,
        backPhoto: true,
      },
    });

    if (checkIns.length < 2) return [];

    const earliest = checkIns[0]!;
    const latest = checkIns[checkIns.length - 1]!;

    return [
      { ...earliest, label: "Start" },
      { ...latest, label: "Today" },
    ];
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.checkIn.findUnique({
        where: { id: input.id },
        include: {
          frontPhoto: true,
          sidePhoto: true,
          backPhoto: true,
        },
      });
    }),

  getImageMetadata: publicProcedure
    .input(z.object({ urls: z.array(z.string().url()) }))
    .query(async ({ input }) => {
      const results = await Promise.all(
        input.urls.map(
          async (url): Promise<{
            size?: number;
            contentType?: string;
            lastModified?: string;
            dateTaken?: string;
          }> => {
            try {
              const res = await fetch(url);
              const contentType = res.headers.get("content-type") ?? undefined;
              const lastModified = res.headers.get("last-modified") ?? undefined;
              const buffer = Buffer.from(await res.arrayBuffer());
              const size = res.headers.get("content-length")
                ? parseInt(res.headers.get("content-length")!, 10)
                : buffer.length;

              let dateTaken: string | undefined;
              try {
                const exif = await exifr.parse(buffer, {
                  pick: ["DateTimeOriginal", "CreateDate"],
                });
                const date =
                  exif?.DateTimeOriginal ?? exif?.CreateDate;
                if (date instanceof Date && !Number.isNaN(date.getTime())) {
                  dateTaken = date.toISOString();
                }
              } catch {
                // No EXIF or unsupported format
              }

              return {
                size,
                contentType,
                lastModified,
                dateTaken,
              };
            } catch {
              return {};
            }
          },
        ),
      );
      return results;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.checkIn.delete({
        where: { id: input.id },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.coerce.date().optional(),
        notes: z.string().optional(),
        weight: z.number().positive().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.checkIn.update({
        where: { id: input.id },
        data: {
          ...(input.date !== undefined && { date: input.date }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.weight !== undefined && { weight: input.weight }),
        },
        include: {
          frontPhoto: true,
          sidePhoto: true,
          backPhoto: true,
        },
      });
    }),

  updateImageAdjustments: publicProcedure
    .input(
      z.object({
        imageId: z.string(),
        zoom: z.number().min(0.5).max(3).nullable().optional(),
        panX: z.number().nullable().optional(),
        panY: z.number().nullable().optional(),
        brightness: z.number().min(0.5).max(1.5).nullable().optional(),
        contrast: z.number().min(0.5).max(1.5).nullable().optional(),
        rotation: z.number().min(-180).max(180).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { imageId, ...adjustments } = input;
      return ctx.db.image.update({
        where: { id: imageId },
        data: adjustments,
      });
    }),
});
