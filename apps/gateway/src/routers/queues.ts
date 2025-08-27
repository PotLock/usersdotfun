import { QueueService } from '@usersdotfun/shared-queue';
import { type QueueName } from '@usersdotfun/shared-types/types';
import { Effect } from 'effect';
import { z } from 'zod';
import { authenticatedProcedure } from '../lib/orpc';
import { AppRuntime } from '../runtime';
import { QueueStatusService } from '@usersdotfun/shared-queue';

// Inline schema definitions
const deleteJobParamSchema = z.object({
  queueName: z.string(),
  jobId: z.string(),
});

const queueNameParamSchema = z.object({
  queueName: z.string(),
});

const clearQueueSchema = z.object({
  queueName: z.string(),
  jobType: z.enum(['all', 'completed', 'failed']),
});

export const queueRouter = {
  getAll: authenticatedProcedure.handler(async () => {
    const program = Effect.gen(function* () {
      const queueStatusService = yield* QueueStatusService;
      const statuses = yield* queueStatusService.getQueuesStatus();
      return { success: true, data: statuses };
    });

    const result = await AppRuntime.runPromise(program);
    return result;
  }),

  getAllJobs: authenticatedProcedure.handler(async () => {
    const program = Effect.gen(function* () {
      const queueStatusService = yield* QueueStatusService;
      const jobs = yield* queueStatusService.getAllJobs();
      return { success: true, data: jobs };
    });

    const result = await AppRuntime.runPromise(program);
    return result;
  }),

  getQueueJobs: authenticatedProcedure
    .input(z.object({ queueName: z.string() }))
    .handler(async ({ input }) => {
      const { queueName } = input;
      
      const program = Effect.gen(function* () {
        const queueStatusService = yield* QueueStatusService;
        const jobs = yield* queueStatusService.getAllJobs({ queueName: queueName as QueueName });
        return { success: true, data: jobs };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    }),

  deleteJob: authenticatedProcedure
    .input(deleteJobParamSchema)
    .handler(async ({ input }) => {
      const { queueName, jobId } = input;
      
      const program = Effect.gen(function* () {
        const queueService = yield* QueueService;
        yield* queueService.removeJob(queueName as QueueName, jobId);
        return { success: true, data: { message: `Job ${jobId} has been deleted.` } };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    }),

  resumeQueue: authenticatedProcedure
    .input(queueNameParamSchema)
    .handler(async ({ input }) => {
      const { queueName } = input;
      
      const program = Effect.gen(function* () {
        const queueService = yield* QueueService;
        yield* queueService.resumeQueue(queueName as QueueName);
        return { success: true, data: { message: `Queue ${queueName} has been resumed.` } };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    }),

  pauseQueue: authenticatedProcedure
    .input(queueNameParamSchema)
    .handler(async ({ input }) => {
      const { queueName } = input;
      
      const program = Effect.gen(function* () {
        const queueService = yield* QueueService;
        yield* queueService.pauseQueue(queueName as QueueName);
        return { success: true, data: { message: `Queue ${queueName} has been paused.` } };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    }),

  clearQueue: authenticatedProcedure
    .input(clearQueueSchema)
    .handler(async ({ input }) => {
      const { queueName, jobType } = input;
      
      const program = Effect.gen(function* () {
        const queueService = yield* QueueService;
        const result = yield* queueService.clearQueue(queueName as QueueName, jobType);
        return { success: true, data: result };
      });

      const result = await AppRuntime.runPromise(program);
      return result;
    })
};
