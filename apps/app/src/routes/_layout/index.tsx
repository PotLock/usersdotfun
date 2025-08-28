import {
  createFileRoute,
  Link,
  useLoaderData,
  ClientOnly,
} from "@tanstack/react-router";
import { ArrowRight, ListTodo, Workflow } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { RecentActivity } from "~/components/recent-activity";
import { orpc } from "~/utils/orpc";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  loader: async ({ context }) => {
    const [workflows, recentJobs] = await Promise.all([
      context.queryClient.ensureQueryData(orpc.workflows.getAll.queryOptions()),
      context.queryClient.ensureQueryData(
        orpc.queues.getAllJobs.queryOptions()
      ),
    ]);

    return { workflows, recentJobs };
  },
});

function Dashboard() {
  const { workflows, recentJobs } = useLoaderData({ from: Route.id });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your workflow automation system
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Workflows</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage your automated workflows
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {`${workflows?.data?.length || 0} workflows`}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/workflows">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Queues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor and control your job queues
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {`${recentJobs?.data?.items?.length || 0} recent jobs`}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/queues">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
