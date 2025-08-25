import { createAuthClient } from "better-auth/client";
import { apiKeyClient } from "better-auth/client/plugins";

export const createTemplateAuthClient = (baseURL: string) => {
  return createAuthClient({
    baseURL,
    plugins: [
      apiKeyClient(),
    ],
  });
};

export type TemplateAuthClient = ReturnType<typeof createTemplateAuthClient>;
