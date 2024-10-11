import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { InternalAppRouter } from "./root";
import { internalAppRouter } from "./root";
import { createCallerFactory, createInternalTRPCContext } from "./trpc";

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */


/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/


/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/

export { createInternalTRPCContext, internalAppRouter, createCallerFactory };
export type { InternalAppRouter};
