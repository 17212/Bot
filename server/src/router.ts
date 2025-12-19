import { router, publicProcedure } from "./trpc.js";
import { z } from "zod";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok" })),
  echo: publicProcedure.input(z.object({ message: z.string() })).query(({ input }) => ({ message: input.message }))
});

export type AppRouter = typeof appRouter;
