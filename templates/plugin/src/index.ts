import {
  ConfigurationError,
  Effect,
  type Plugin,
  PluginExecutionError,
  PluginLoggerTag,
} from "@usersdotfun/core-sdk";
import { TemplateClient } from "./client";
import {
  type TemplateConfig,
  TemplateConfigSchema,
  type TemplateInput,
  TemplateInputSchema,
  type TemplateOutput,
  TemplateOutputSchema,
} from "./schemas";

export class TemplatePlugin
  implements
    Plugin<
      typeof TemplateInputSchema,
      typeof TemplateOutputSchema,
      typeof TemplateConfigSchema
    >
{
  readonly id = "@Template/plugin" as const;
  readonly type = "transformer" as const;
  readonly inputSchema = TemplateInputSchema;
  readonly outputSchema = TemplateOutputSchema;
  readonly configSchema = TemplateConfigSchema;

  private config: TemplateConfig | null = null;
  private client: TemplateClient | null = null;

  initialize(
    config?: TemplateConfig,
  ): Effect.Effect<void, ConfigurationError, PluginLoggerTag> {
    const self = this;
    return Effect.gen(function* () {
      const logger = yield* PluginLoggerTag;

      if (!config?.secrets?.apiKey) {
        const error = new ConfigurationError("API key is required.");
        yield* logger.logError(
          "Configuration error: API key is missing.",
          error,
        );
        yield* Effect.fail(error);
        return;
      }

      self.config = config;

      // Initialize Template client with tRPC and auth client
      try {
        self.client = new TemplateClient(
          config.variables?.baseUrl || "http://localhost:1337",
          config.secrets.apiKey,
        );
      } catch (clientError) {
        const error = new ConfigurationError(
          `Failed to initialize Template client: ${clientError instanceof Error ? clientError.message : "Unknown error"}`,
        );
        yield* logger.logError("Client initialization failed", error);
        yield* Effect.fail(error);
        return;
      }

      // Test connection
      yield* Effect.tryPromise({
        try: () => {
          if (!self.client) {
            throw new Error("Client not initialized");
          }
          return self.client.healthCheck();
        },
        catch: (healthCheckError) => {
          const error = new ConfigurationError(
            `Health check failed: ${healthCheckError instanceof Error ? healthCheckError.message : "Unknown error"}`,
          );
          return error;
        },
      });

      yield* logger.logInfo("Template plugin initialized successfully", {
        pluginId: self.id,
        baseUrl: config.variables?.baseUrl,
      });
    });
  }

  execute(
    input: TemplateInput,
  ): Effect.Effect<TemplateOutput, PluginExecutionError, PluginLoggerTag> {
    const self = this;
    return Effect.gen(function* () {
      const logger = yield* PluginLoggerTag;

      if (!self.config || !self.client) {
        yield* Effect.fail(
          new PluginExecutionError("Plugin not initialized", false),
        );
      }

      yield* logger.logDebug("Executing Template social feedback workflow", {
        pluginId: self.id,
      });

      return yield* Effect.tryPromise({
        try: async () => {
          
          return {
            success: true,
            data: {
              
            },
          } as TemplateOutput;
        },
        catch: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          return new PluginExecutionError(
            `Social feedback workflow failed: ${errorMessage}`,
            true,
          );
        },
      });
    });
  }


  shutdown(): Effect.Effect<void, never, PluginLoggerTag> {
    const self = this;
    return Effect.gen(function* () {
      const logger = yield* PluginLoggerTag;
      yield* logger.logInfo("Shutting down Template plugin", {
        pluginId: self.id,
      });
      self.config = null;
      self.client = null;
    });
  }
}

export default TemplatePlugin;
