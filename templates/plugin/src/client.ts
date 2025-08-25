import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "your-client";
import { type TemplateAuthClient, createTemplateAuthClient } from "./auth-client";

export class TemplateClient {
  private trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
  private authClient: TemplateAuthClient;

  constructor(baseUrl: string, apiKey: string) {
    this.trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${baseUrl}/trpc`,
          headers: {
            "x-api-key": apiKey,
          },
        }),
      ],
    });

    this.authClient = createTemplateAuthClient(baseUrl);
  }

  async healthCheck(): Promise<string> {
    return this.trpcClient.healthCheck.query();
  }

}
