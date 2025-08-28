import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
// import { allQueueJobsQueryOptions } from "~/lib/queries";

export function RecentActivity() {
  // const { data: recentJobsResponse } = useQuery(allQueueJobsQueryOptions({ limit: 10 }));
  // console.log("got recent jobs", recentJobsResponse);
  // const recentJobs = recentJobsResponse?.data?.items || [];
  const recentJobs = [];

  const displayJobs = recentJobs?.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Button asChild variant="outline" size="sm">
          <Link to="/queues">View All Jobs</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {!displayJobs?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity found
            </div>
          ) : (
            <div className="space-y-3">
              {displayJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-muted-foreground">
                      {job.id.slice(0, 8)}...
                    </div>
                    <div className="text-sm">{job.name}</div>
                    {job.data.workflowId && (
                      <Link
                        to="/workflows/$workflowId"
                        params={{ workflowId: job.data.workflowId }}
                        className="text-xs text-primary hover:underline"
                      >
                        {job.data.workflowId.slice(0, 8)}...
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(job.timestamp).toLocaleString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {job.attemptsMade} attempts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
