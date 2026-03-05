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
          frontPhoto: input.frontPhotoUrl,
          sidePhoto: input.sidePhotoUrl,
          backPhoto: input.backPhotoUrl,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.checkIn.findMany({
      orderBy: { date: "desc" },
    });
  }),

  getMilestones: publicProcedure.query(async ({ ctx }) => {
    const checkIns = await ctx.db.checkIn.findMany({
      orderBy: { date: "asc" },
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
        notes: z.string().optional(),
        weight: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.checkIn.update({
        where: { id: input.id },
        data: {
          notes: input.notes,
          weight: input.weight,
        },
      });
    }),
});
