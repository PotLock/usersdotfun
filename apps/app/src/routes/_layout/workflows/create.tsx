import {
  createFileRoute,
  useNavigate
} from "@tanstack/react-router";
import { createWorkflowSchema } from "@usersdotfun/shared-types/schemas";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { JsonEditor } from "~/components/common/json-editor";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { workflowsCollection } from "~/db/collections";

export const Route = createFileRoute("/_layout/workflows/create")({
  component: CreateWorkflowPage,
});

function CreateWorkflowPage() {
  return <WorkflowCreate />;
}

function WorkflowCreate() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext(); // TODO: we should know that user is active

  const onSubmit = (data: z.infer<typeof createWorkflowSchema>) => {
    if (!data || !data.name) {
      toast.error("Please provide workflow data");
      return;
    }

    const newWorkflow = {
      id: "...",
      createdBy: user.id,
      user: user,
      createdAt: new Date(),
      ...data,
    };

    workflowsCollection.insert(newWorkflow);

    toast.success("Workflow created successfully!");
    navigate({ to: "/workflows" });
  };

  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonEditorWithAtom onSubmit={onSubmit} />
      </TabsContent>
    </Tabs>
  );
}

function JsonEditorWithAtom({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof createWorkflowSchema>) => void;
}) {
  const [editedWorkflow, setEditedWorkflow] = useState<z.infer<
    typeof createWorkflowSchema
  > | null>(null);

  createWorkflowSchema;

  return (
    <div>
      <JsonEditor
        value={editedWorkflow}
        onChange={(value) => setEditedWorkflow(value)}
        schema={createWorkflowSchema}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={() => editedWorkflow && onSubmit(editedWorkflow)}>
          Save from JSON
        </Button>
      </div>
    </div>
  );
}
