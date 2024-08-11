//export type { Session } from "next-auth";
export interface Session {
  userId: string;
}

export { isSecureContext } from "./config";
