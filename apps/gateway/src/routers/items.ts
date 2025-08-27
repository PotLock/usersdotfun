import { WorkflowService } from '@usersdotfun/shared-db';
import { QueueService } from '@usersdotfun/shared-queue';
import { QUEUE_NAMES } from '@usersdotfun/shared-types/types';
import { Effect } from 'effect';
import { z } from 'zod';
import { authenticatedProcedure, adminProcedure } from '../lib/orpc';
import { AppRuntime } from '../runtime';

export const itemRouter = {
  getPluginRuns: authenticatedProcedure
    .input(z.object({ itemId: z.string() }))
    .handler(async ({ input }) => {
      const { itemId } = input;

      const program = Effect.gen(function* () {
        const workflowService = yield* WorkflowService;
        const pluginRuns = yield* workflowService.getPluginRunsForItem(itemId);
        return { success: true, data: pluginRuns };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    }),

  getWorkflowRuns: authenticatedProcedure
    .input(z.object({ itemId: z.string() }))
    .handler(async ({ input }) => {
      const { itemId } = input;

      const program = Effect.gen(function* () {
        const workflowService = yield* WorkflowService;
        const workflowRuns = yield* workflowService.getWorkflowRunsForItem(itemId);
        return { success: true, data: workflowRuns };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    }),
    
  retryPluginRun: adminProcedure
    .input(z.object({ 
      itemId: z.string(), 
      pluginRunId: z.string() 
    }))
    .handler(async ({ input }) => {
      const { itemId, pluginRunId } = input;

      const program = Effect.gen(function* () {
        const workflowService = yield* WorkflowService;
        const queueService = yield* QueueService;
        
        const pluginRun = yield* workflowService.updatePluginRun(pluginRunId, {
          status: 'PENDING',
          error: null,
          output: null,
          completedAt: null,
        });
        
        const workflowRun = yield* workflowService.getWorkflowRunById(pluginRun.workflowRunId);
        
        yield* queueService.add(QUEUE_NAMES.PIPELINE_EXECUTION, `retry-from-step-${pluginRun.stepId}`, {
          workflowId: workflowRun.workflowId,
          workflowRunId: pluginRun.workflowRunId,
          data: {
            sourceItemId: itemId,
            input: pluginRun.input as Record<string, unknown>,
            startAtStepId: pluginRun.stepId,
          }
        });

        return { 
          success: true, 
          data: { 
            message: `Plugin run ${pluginRunId} queued for retry from step ${pluginRun.stepId}` 
          } 
        };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    })
};
