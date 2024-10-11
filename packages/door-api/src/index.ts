import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { Request } from "express";
import type { AppRouter } from "./root";
import { appRouter } from "./root";
import { createCallerFactory, createTRPCContext,createInternalTRPCContext } from "./trpc";
import type { InternalAppRouter } from "./root";
import { internalAppRouter } from "./root";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { createTRPCContext, appRouter,internalAppRouter, createCaller,createInternalTRPCContext };
export type { AppRouter, RouterInputs, RouterOutputs, InternalAppRouter };
