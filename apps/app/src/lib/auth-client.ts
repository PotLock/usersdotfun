import { BetterAuthClientPlugin } from "better-auth";
import { adminClient, anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { siwnClient } from "better-near-auth/client";

export const authClient = createAuthClient({
  baseURL: import.meta.env.BETTER_AUTH_URL,
  plugins: [
    anonymousClient(),
    siwnClient({
      domain: import.meta.env.BETTER_AUTH_URL,
    }),
    adminClient() as unknown as BetterAuthClientPlugin
  ]
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
