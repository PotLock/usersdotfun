import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "~/utils/orpc";

export const queryKeys = {
  workflows: {
    all: () => ["workflows"] as const,
    detail: (workflowId: string) => ["workflows", workflowId] as const,
    runs: (workflowId: string) => ["workflows", workflowId, "runs"] as const,
    items: (workflowId: string) => ["workflows", workflowId, "items"] as const,
    runItems: (workflowId: string, runId: string) => ["workflows", workflowId, "runs", runId, "items"] as const,
    runPluginRuns: (workflowId: string, runId: string, type?: string) => ["workflows", workflowId, "runs", runId, "plugin-runs", type] as const,
    itemPluginRuns: (workflowId: string, itemId: string) => ["workflows", workflowId, "items", itemId, "plugin-runs"] as const,
  },
  runs: {
    detail: (runId: string) => ["runs", runId, "details"] as const,
    items: (runId: string) => ["runs", runId, "items"] as const,
    pluginRuns: (runId: string, type?: string) => ["runs", runId, "plugin-runs", type] as const,
  },
  items: {
    pluginRuns: (itemId: string, workflowId?: string) => ["items", itemId, "plugin-runs", workflowId] as const,
    workflowRuns: (itemId: string) => ["items", itemId, "workflow-runs"] as const,
  },
  queues: {
    all: () => ["queues"] as const,
    detail: (queueName: string) => ["queues", queueName] as const,
    jobs: (queueName?: string) => ["queues", queueName ?? "all", "jobs"] as const,
  },
} as const;

// --- Query Options ---
export const workflowsQueryOptions = orpc.workflows.getAll.queryOptions();

export const workflowQueryOptions = (workflowId: string) => 
  orpc.workflows.getById.queryOptions({ input: { id: workflowId } });

export const workflowRunsQueryOptions = (workflowId: string) => 
  orpc.workflows.getRuns.queryOptions({ input: { id: workflowId } });

export const runDetailsQueryOptions = (runId: string) => 
  orpc.runs.getDetails.queryOptions({ input: { runId } });

export const workflowItemsQueryOptions = (workflowId: string) => 
  orpc.workflows.getItems.queryOptions({ input: { id: workflowId } });

export const queuesStatusQueryOptions = orpc.queues.getAll.queryOptions();

export const queueDetailsQueryOptions = (queueName: string) => 
  orpc.queues.getQueueJobs.queryOptions({ input: { queueName } });

export const allQueueJobsQueryOptions = (filters?: {
  status?: string;
  queueName?: string;
  limit?: number;
}) => orpc.queues.getAllJobs.queryOptions({ input: filters });

export const workflowRunItemsQueryOptions = (runId: string) => 
  orpc.runs.getItems.queryOptions({ input: { runId } });

export const itemPluginRunsQueryOptions = (itemId: string, workflowId?: string) => {
  if (workflowId) {
    return orpc.workflows.getItemPluginRuns.queryOptions({ input: { id: workflowId, itemId } });
  } else {
    return orpc.items.getPluginRuns.queryOptions({ input: { itemId } });
  }
};

export const itemWorkflowRunsQueryOptions = (itemId: string) => 
  orpc.items.getWorkflowRuns.queryOptions({ input: { itemId } });

export const workflowRunPluginRunsQueryOptions = (runId: string, type?: 'SOURCE' | 'PIPELINE') => 
  orpc.runs.getPluginRuns.queryOptions({ input: { runId, type } });

// --- Mutations ---
export const useCreateWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(orpc.workflows.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
    },
  }));
};

export const useUpdateWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, workflow }: { id: string; workflow: any }) =>
      orpc.workflows.update.call({ id, ...workflow }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workflows.detail(id),
      });
    },
  });
};

export const useDeleteWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orpc.workflows.delete.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
    },
  });
};

export const useToggleWorkflowStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orpc.workflows.toggle.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
    },
  });
};

export const useRunWorkflowNowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orpc.workflows.run.call({ id }),
    onSuccess: (_, workflowId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workflows.runs(workflowId),
      });
    },
  });
};

export const useCancelWorkflowRunMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => orpc.runs.cancel.call({ runId }),
    onSuccess: (_data, runId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.detail(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.items(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.pluginRuns(runId),
      });
      // Invalidate all workflow runs since we don't know which workflow this run belongs to
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
};

export const useDeleteWorkflowRunMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => orpc.runs.delete.call({ runId }),
    onSuccess: (_data, runId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.detail(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.items(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.pluginRuns(runId),
      });
      // Invalidate all workflow runs since we don't know which workflow this run belongs to
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
};

export const useRetryWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      runId,
      itemId,
      fromStepId,
    }: {
      runId: string;
      itemId: string;
      fromStepId: string;
    }) =>
      orpc.runs.retryFromStep.call({ runId, itemId, fromStepId }),
    onSuccess: (_, { runId, itemId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.detail(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.items(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.runs.pluginRuns(runId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.items.pluginRuns(itemId),
      });
    },
  });
};

// Queue mutations

export const useRemoveQueueJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      queueName,
      jobId,
    }: {
      queueName: string;
      jobId: string;
    }) =>
      orpc.queues.deleteJob.call({ queueName, jobId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.queues.jobs(variables.queueName),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.queues.all() });
    },
  });
};

export const usePauseQueueMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queueName: string) =>
      orpc.queues.pauseQueue.call({ queueName }),
    onSuccess: (_data, queueName) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queues.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.queues.jobs(queueName),
      });
    },
  });
};

export const useResumeQueueMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queueName: string) =>
      orpc.queues.resumeQueue.call({ queueName }),
    onSuccess: (_data, queueName) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queues.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.queues.jobs(queueName),
      });
    },
  });
};

export const useClearQueueMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      queueName,
      jobType = "all",
    }: {
      queueName: string;
      jobType?: "all" | "completed" | "failed";
    }) =>
      orpc.queues.clearQueue.call({ queueName, jobType }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queues.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.queues.jobs(variables.queueName),
      });
    },
  });
};

// Retry mutation
export const useRetryPluginRunMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, pluginRunId }: { itemId: string; pluginRunId: string }) =>
      orpc.items.retryPluginRun.call({ itemId, pluginRunId }),
    onSuccess: (_, { itemId }) => {
      // More targeted invalidations
      queryClient.invalidateQueries({ queryKey: queryKeys.items.pluginRuns(itemId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.items.workflowRuns(itemId) });
      // Invalidate all queue jobs since plugin runs affect job status
      queryClient.invalidateQueries({ queryKey: queryKeys.queues.all() });
    },
  });
};
