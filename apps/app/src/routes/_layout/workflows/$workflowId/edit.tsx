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
import { workflowsCollection } from "~/db/collections";
import { orpc } from "~/utils/orpc";

export const Route = createFileRoute("/_layout/workflows/$workflowId/edit")({
  loader: ({ params: { workflowId }, context: { queryClient } }) =>
    queryClient.ensureQueryData(
      orpc.workflows.getById.queryOptions({ input: { id: workflowId } })
    ),
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

  const onSubmit = (data: any) => {
    if (!data) {
      toast.error("Please provide workflow data");
      return;
    }

    // Optimistic update - changes appear immediately in UI
    workflowsCollection.update(workflowId, (draft) => {
      Object.assign(draft, {
        name: data.name || draft.name,
        source: data.source,
        pipeline: data.pipeline,
        schedule: data.schedule !== undefined ? data.schedule : draft.schedule,
        status: data.status || draft.status,
      });
    });

    toast.success("Workflow updated successfully!");
    navigate({ to: "/workflows/$workflowId", params: { workflowId } });
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
  const [editedWorkflow, setEditedWorkflow] = useState<UpdateWorkflowData | null>(
    workflow
  );

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
