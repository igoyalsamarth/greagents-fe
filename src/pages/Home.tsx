import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertCircle, Bot, Loader2, Users } from 'lucide-react';
import {
  fetchDashboard,
  type DashboardRecentActivityItem,
} from '@/lib/api';

function activitySummaryLine(item: DashboardRecentActivityItem): string {
  const kind = item.workflow === 'code' ? 'Issue' : 'PR';
  return `${kind} #${item.itemNumber} · ${item.githubFullName}`;
}

export default function Home() {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your workspace.
        </p>
      </div>

      {data?.workspaceRole === 'user' ? (
        <p className="text-sm text-muted-foreground rounded-md border bg-muted/30 px-3 py-2">
          You are a workspace member: activity and usage here are limited to your own runs.
        </p>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Could not load dashboard. Try refreshing the page.</span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <div className="text-2xl font-bold">{data?.activeAgentsCount ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Agent types enabled on at least one repository
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <div className="text-2xl font-bold">{data?.teamMemberCount ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Members in your organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <div className="text-2xl font-bold">{data?.activityLast24Hours ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Workflow runs in the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest agent workflow runs</CardDescription>
          </div>
          {isFetching && !isLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : null}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : data?.recentActivity?.length ? (
            <ul className="space-y-3 text-sm">
              {data.recentActivity.map((item, i) => (
                <li
                  key={`${item.githubFullName}-${item.workflow}-${item.itemNumber}-${item.createdAt ?? i}`}
                  className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{activitySummaryLine(item)}</span>
                  {item.createdAt ? (
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
