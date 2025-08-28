import {
  createFileRoute,
  Link,
  Outlet,
  useLoaderData,
  useParams,
} from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkflowRun } from "@usersdotfun/shared-types/types";
import { DataTable } from "~/components/common/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  workflowQueryOptions,
  workflowRunsQueryOptions,
  useCancelWorkflowRunMutation,
  useDeleteWorkflowRunMutation,
} from "~/lib/queries";
import { workflowRunStatusColors } from "~/lib/status-colors";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "~/utils/orpc";
import { toast } from "sonner";

export const Route = createFileRoute("/_layout/workflows/$workflowId/runs")({
  component: WorkflowRunsPage,
  loader: async ({ params: { workflowId }, context: { queryClient } }) => {
    const workflow = await queryClient.ensureQueryData(
      workflowQueryOptions(workflowId)
    );
    const runs = await queryClient.ensureQueryData(
      workflowRunsQueryOptions(workflowId)
    );
    return { workflow, runs };
  },
});

const columns: ColumnDef<WorkflowRun>[] = [
  {
    accessorKey: "id",
    header: "Run ID",
    cell: ({ row }) => {
      const run = row.original;
      const { workflowId } = useParams({
        from: "/_layout/workflows/$workflowId/runs",
      });
      return (
        <Link
          to="/workflows/$workflowId/runs/$runId"
          params={{ workflowId, runId: run.id }}
          className="font-mono text-sm text-primary hover:underline"
          preload="intent"
        >
          {run.id.slice(0, 12)}...
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={workflowRunStatusColors[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "startedAt",
    header: "Started At",
    cell: ({ row }) => new Date(row.original.startedAt).toLocaleString(),
  },
  {
    accessorKey: "completedAt",
    header: "Completed At",
    cell: ({ row }) =>
      row.original.completedAt
        ? new Date(row.original.completedAt).toLocaleString()
        : "N/A",
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const run = row.original;
      const { workflowId } = useParams({
        from: "/_layout/workflows/$workflowId/runs",
      });

      const cancelMutation = useCancelWorkflowRunMutation();
      const deleteMutation = useDeleteWorkflowRunMutation();

      const onCancel = () => {
        cancelMutation.mutate(run.id, {
          onSuccess: () => {
            toast.success("Run cancelled");
          },
          onError: (error) => {
            toast.error(`Failed to cancel run: ${error.message}`);
          },
        });
      };

      const onDelete = () => {
        deleteMutation.mutate(run.id, {
          onSuccess: () => {
            toast.success("Run deleted");
          },
          onError: (error) => {
            toast.error(`Failed to delete run: ${error.message}`);
          },
        });
      };

      return (
        <div className="flex gap-2">
          {run.status === "RUNNING" && (
            <Button variant="destructive" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {run.status === "PENDING" && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      );
    },
  },
];

function WorkflowRunsPage() {
  const { workflow } = useLoaderData({
    from: "/_layout/workflows/$workflowId/runs",
  });
  const { workflowId } = useParams({
    from: "/_layout/workflows/$workflowId/runs",
  });

  // Query for workflow runs that automatically updates
  const { data: runsResponse } = useQuery(workflowRunsQueryOptions(workflowId));
  const runs = runsResponse?.data || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Workflow Runs: {workflow?.data?.name}
        </h1>
        <p className="text-muted-foreground">
          View and inspect the execution history of your workflow.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={runs || []}
        filterColumnId="id"
        filterPlaceholder="Filter by Run ID..."
      />
      <Outlet />
    </div>
  );
}
