import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@dumbledoor/db";
import Discord from "next-auth/providers/discord";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const isSecureContext = process.env.NODE_ENV !== "development";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [Discord],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable with session strategy";

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await prisma.session.findUnique({
    where: {
      sessionToken: sessionToken,
    },
    include: {
      user: true,
    },
  });
  return session
    ? {
        user: {
          ...session.user,
        },
        expires: session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  await prisma.session.delete({
    where: {
      sessionToken: token,
    },
  });
};
