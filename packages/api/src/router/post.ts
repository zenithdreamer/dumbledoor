import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { CreatePostSchema } from "@dumbledoor/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(() => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    //return ctx.prisma.post.findMany({ orderBy: { id: "desc" } });
    return [];
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    //.query(({ ctx, input }) => {
    .query(() => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      // return ctx.prisma.post.findFirst({
      //   where: { id: input.id },
      // });
      return null;
    }),

  create: protectedProcedure.input(CreatePostSchema).mutation(() => {
    return true;
  }),
} satisfies TRPCRouterRecord;
