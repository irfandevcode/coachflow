import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createAuditSubmission } from "./db";
import { askCoachFlowGemini } from "./gemini";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  audit: router({
    submit: publicProcedure.input(z.object({
      name: z.string().min(1).max(160),
      email: z.string().email().max(320),
      website: z.string().max(500),
      niche: z.string().max(180),
      offer: z.string().max(1000),
      price: z.string().max(100),
      monthlyLeads: z.string().max(100),
      bookedCalls: z.string().max(100),
      leadSource: z.string().max(100),
      challenge: z.string().max(100),
      overallScore: z.number().int().min(0).max(100),
      categoryScores: z.array(z.object({ label: z.string(), score: z.number().int().min(0).max(100) })),
    })).mutation(async ({ input }) => {
      const persisted = await createAuditSubmission({
        ...input,
        website: input.website || null,
        niche: input.niche || null,
        offer: input.offer || null,
        price: input.price || null,
        monthlyLeads: input.monthlyLeads || null,
        bookedCalls: input.bookedCalls || null,
        leadSource: input.leadSource || null,
        challenge: input.challenge || null,
        categoryScores: JSON.stringify(input.categoryScores),
      });
      return { success: true, persisted } as const;
    }),
  }),
  ai: router({
    chat: publicProcedure.input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4_000),
      })).min(1).max(12),
      qualification: z.object({
        stage: z.number().int().min(0).max(4),
        answers: z.object({
          goal: z.string().max(800).optional(),
          offer: z.string().max(800).optional(),
          leadFlow: z.string().max(800).optional(),
          timeline: z.string().max(800).optional(),
        }),
      }),
    })).mutation(async ({ input }) => ({
      content: await askCoachFlowGemini(input.messages, input.qualification),
    })),
  }),
});

export type AppRouter = typeof appRouter;
