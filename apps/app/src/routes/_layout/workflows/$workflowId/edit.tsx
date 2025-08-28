import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { UpdateWorkflowData } from "@usersdotfun/shared-db/src/services";
import { updateWorkflowSchema } from "@usersdotfun/shared-types/schemas";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JsonEditor } from "~/components/common/json-editor";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useUpdateWorkflowMutation, workflowQueryOptions } from "~/lib/queries";

export const Route = createFileRoute("/_layout/workflows/$workflowId/edit")({
  loader: ({ params: { workflowId }, context: { queryClient } }) =>
    queryClient.ensureQueryData(workflowQueryOptions(workflowId)),
  component: EditWorkflowPage,
});

function EditWorkflowPage() {
  const workflow = useLoaderData({ from: Route.id });

  if (!workflow?.data) {
    return null;
  }

  return <WorkflowEdit workflow={workflow.data} />;
}

function WorkflowEdit({ workflow }: { workflow: UpdateWorkflowData }) {
  const { workflowId } = Route.useParams();
  const navigate = useNavigate();
  const updateMutation = useUpdateWorkflowMutation();

  const onSubmit = (data: any) => {
    if (!data) {
      toast.error("Please provide workflow data");
      return;
    }

    const updateData = {
      name: data.name || workflow.name,
      source: data.source,
      pipeline: data.pipeline,
      schedule: data.schedule !== undefined ? data.schedule : workflow.schedule,
      status: data.status || workflow.status,
    };

    updateMutation.mutate(
      { id: workflowId, workflow: updateData },
      {
        onSuccess: () => {
          toast.success("Workflow updated successfully!");
          navigate({ to: "/workflows/$workflowId", params: { workflowId } });
        },
        onError: (error) => {
          toast.error(`Failed to update workflow: ${error.message}`);
        },
      }
    );
  };

  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonEditorWithAtom workflow={workflow} onSubmit={onSubmit} />
      </TabsContent>
    </Tabs>
  );
}

function JsonEditorWithAtom({
  workflow,
  onSubmit,
}: {
  workflow: UpdateWorkflowData;
  onSubmit: (data: any) => void;
}) {
  const [editedWorkflow, setEditedWorkflow] =
    useState<UpdateWorkflowData | null>(workflow);

  useEffect(() => {
    setEditedWorkflow(updateWorkflowSchema.parse(workflow));
  }, [workflow]);

  return (
    <div>
      <JsonEditor
        value={editedWorkflow}
        onChange={(value) => setEditedWorkflow(value)}
        schema={updateWorkflowSchema}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={() => onSubmit(editedWorkflow)}>Save from JSON</Button>
      </div>
    </div>
  );
}
