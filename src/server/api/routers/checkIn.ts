import { z } from "zod";

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

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.checkIn.findUnique({
        where: { id: input.id },
      });
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
