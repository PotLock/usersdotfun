// import { queryCollectionOptions } from '@tanstack/query-db-collection';
// import { createCollection } from '@tanstack/react-db';
// import { orpc, queryClient } from '~/utils/orpc';

// // Workflows Collection
// export const workflowsCollection = createCollection(
//   queryCollectionOptions({
//     queryClient,
//     queryKey: ['workflows'],
//     queryFn: async () => {
//       const response = await orpc.workflows.getAll.call();
//       return response.data || [];
//     },
//     getKey: (workflow) => workflow.id,
//     onInsert: async ({ transaction }) => {
//       const { modified: newWorkflow } = transaction.mutations[0];
//       // TODO
//       // @ts-expect-error mismatch on getAll (summary) vs create workflow type
//       await orpc.workflows.create.call(newWorkflow);
//     },
//     onUpdate: async ({ transaction }) => {
//       const { original, modified } = transaction.mutations[0];
//       // TODO
//       // @ts-expect-error mismatch on getAll (summary) vs update workflow type
//       await orpc.workflows.update.call({ id: original.id, ...modified });
//     },
//     onDelete: async ({ transaction }) => {
//       const { original } = transaction.mutations[0];
//       await orpc.workflows.delete.call({ id: original.id });
//     },
//   })
// );

// // Workflow Runs Collection (parameterized by workflowId)
// export const createWorkflowRunsCollection = (workflowId: string) =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['workflows', workflowId, 'runs'],
//       queryFn: async () => {
//         const response = await orpc.workflows.getRuns.call({ id: workflowId });
//         return response.data || [];
//       },
//       getKey: (run) => run.id,
//       onUpdate: async ({ transaction }) => {
//         const { original, modified } = transaction.mutations[0];
//         // Handle run updates if needed
//         if (modified.status === 'CANCELLED') {
//           await orpc.runs.cancel.call({ runId: original.id });
//         }
//       },
//       onDelete: async ({ transaction }) => {
//         const { original } = transaction.mutations[0];
//         await orpc.runs.delete.call({ runId: original.id });
//       },
//     })
//   );

// // Run Details Collection
// export const createRunDetailsCollection = (runId: string) =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['runs', runId, 'details'],
//       queryFn: async () => {
//         const response = await orpc.runs.getDetails.call({ runId });
//         return [response.data]; // Wrap single item in array for collection
//       },
//       getKey: (run) => run.id,
//       onUpdate: async ({ transaction }) => {
//         const { original, modified } = transaction.mutations[0];
//         if (modified.status === 'CANCELLED') {
//           await orpc.runs.cancel.call({ runId: original.id });
//         }
//       },
//       onDelete: async ({ transaction }) => {
//         const { original } = transaction.mutations[0];
//         await orpc.runs.delete.call({ runId: original.id });
//       },
//     })
//   );

// // Workflow Items Collection
// export const createWorkflowItemsCollection = (workflowId: string) =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['workflows', workflowId, 'items'],
//       queryFn: async () => {
//         const response = await orpc.workflows.getItems.call({ id: workflowId });
//         return response.data || [];
//       },
//       getKey: (item) => item.id,
//       // Items are typically read-only, but we can add mutations if needed
//     })
//   );

// // Queue Jobs Collection
// export const queueJobsCollection = createCollection(
//   queryCollectionOptions({
//     queryClient,
//     queryKey: ['queues', 'jobs'],
//     queryFn: async () => {
//       const response = await orpc.queues.getAllJobs.call();
//       console.log("got response", response);
//       return response.data?.items || [];
//     },
//     getKey: (job) => job.id,
//     onDelete: async ({ transaction }) => {
//       const { original } = transaction.mutations[0];
//       await orpc.queues.deleteJob.call({
//         queueName: original.queueName,
//         jobId: original.id
//       });
//     },
//   })
// );

// // Queue Status Collection
// export const queueStatusCollection = createCollection(
//   queryCollectionOptions({
//     queryClient,
//     queryKey: ['queues', 'status'],
//     queryFn: async () => {
//       const response = await orpc.queues.getAll.call();
//       return response.data || [];
//     },
//     getKey: (queue) => queue.name,
//     onUpdate: async ({ transaction }) => {
//       const { original, modified } = transaction.mutations[0];
//       if (modified.paused !== original.paused) {
//         if (modified.paused) {
//           await orpc.queues.pauseQueue.call({ queueName: original.name });
//         } else {
//           await orpc.queues.resumeQueue.call({ queueName: original.name });
//         }
//       }
//     },
//   })
// );

// // Run Items Collection
// export const createRunItemsCollection = (runId: string) =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['runs', runId, 'items'],
//       queryFn: async () => {
//         const response = await orpc.runs.getItems.call({ runId });
//         return response.data || [];
//       },
//       getKey: (item) => item.id,
//     })
//   );

// // Plugin Runs Collection
// export const createPluginRunsCollection = (runId: string, type?: 'SOURCE' | 'PIPELINE') =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['runs', runId, 'plugin-runs', type],
//       queryFn: async () => {
//         const response = await orpc.runs.getPluginRuns.call({ runId, type });
//         return response.data?.pluginRuns || [];
//       },
//       getKey: (pluginRun) => pluginRun.id,
//       onUpdate: async ({ transaction }) => {
//         const { original, modified } = transaction.mutations[0];
//         // Handle plugin run retries
//         if (modified.status === 'PENDING' && original.status === 'FAILED') {
//           if (original.sourceItemId) {
//             await orpc.items.retryPluginRun.call({
//               itemId: original.sourceItemId,
//               pluginRunId: original.id
//             });
//           }
//         }
//       },
//     })
//   );

// // Item Plugin Runs Collection
// export const createItemPluginRunsCollection = (itemId: string) =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['items', itemId, 'plugin-runs'],
//       queryFn: async () => {
//         const response = await orpc.items.getPluginRuns.call({ itemId });
//         return response.data || [];
//       },
//       getKey: (pluginRun) => pluginRun.id,
//       onUpdate: async ({ transaction }) => {
//         const { original, modified } = transaction.mutations[0];
//         if (modified.status === 'PENDING' && original.status === 'FAILED') {
//           await orpc.items.retryPluginRun.call({
//             itemId,
//             pluginRunId: original.id
//           });
//         }
//       },
//     })
//   );

// // Item Workflow Runs Collection
// export const createItemWorkflowRunsCollection = (itemId: string) =>
//   createCollection(
//     queryCollectionOptions({
//       queryClient,
//       queryKey: ['items', itemId, 'workflow-runs'],
//       queryFn: async () => {
//         const response = await orpc.items.getWorkflowRuns.call({ itemId });
//         return response.data || [];
//       },
//       getKey: (run) => run.id,
//     })
//   );
