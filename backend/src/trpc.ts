import { initTRPC } from "@trpc/server";

export type Context = Record<string, unknown>;

export const createContext = (): Context => ({});

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
