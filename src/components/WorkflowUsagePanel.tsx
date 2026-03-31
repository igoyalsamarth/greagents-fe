import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type GitHubWorkflowKind, type WorkflowUsageResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BarChart3, ChevronDown } from "lucide-react";

const USAGE_QUERY = { repo_limit: 50, item_limit: 100 } as const;

const numberFmt = new Intl.NumberFormat(undefined);

function formatNumber(n: number): string {
  return numberFmt.format(n);
}

function formatCostUsd(cost: string): string {
  const v = Number(cost);
  if (Number.isNaN(v)) return cost;
  return `$${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)}`;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function githubItemUrl(
  githubFullName: string,
  workflow: GitHubWorkflowKind,
  itemNumber: number,
): string {
  const base = `https://github.com/${githubFullName}`;
  return workflow === "review"
    ? `${base}/pull/${itemNumber}`
    : `${base}/issues/${itemNumber}`;
}

const COPY: Record<
  GitHubWorkflowKind,
  {
    itemHeader: string;
    distinctNoun: string;
    emptyBreakdown: string;
  }
> = {
  code: {
    itemHeader: "Issue",
    distinctNoun: "issues",
    emptyBreakdown: "No per-issue breakdown.",
  },
  review: {
    itemHeader: "PR",
    distinctNoun: "PRs",
    emptyBreakdown: "No per-PR breakdown.",
  },
};

export type WorkflowUsagePanelProps = {
  workflow: GitHubWorkflowKind;
  queryKeyPrefix: string;
  title?: string;
  cardDescription: string;
};

export function WorkflowUsagePanel({
  workflow,
  queryKeyPrefix,
  title = "Usage",
  cardDescription,
}: WorkflowUsagePanelProps) {
  const labels = COPY[workflow];

  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError,
  } = useQuery<WorkflowUsageResponse>({
    queryKey: [queryKeyPrefix, "workflow-usage", workflow, USAGE_QUERY],
    queryFn: async () => {
      return api
        .get("agents/usage", {
          searchParams: {
            workflow,
            repo_limit: USAGE_QUERY.repo_limit,
            item_limit: USAGE_QUERY.item_limit,
          },
        })
        .json<WorkflowUsageResponse>();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageLoading ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : usageError ? (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Could not load usage
              </p>
              <p className="text-muted-foreground mt-1">
                Try again later or contact support if this persists.
              </p>
            </div>
          </div>
        ) : usage ? (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Total runs
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {formatNumber(usage.summary.runCount)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Input tokens
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {formatNumber(usage.summary.totalInputTokens)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Output tokens
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {formatNumber(usage.summary.totalOutputTokens)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Total tokens
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {formatNumber(usage.summary.totalTokens)}
                </p>
              </div>
              <div className="rounded-lg border p-4 col-span-2 sm:col-span-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Estimated cost
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {formatCostUsd(usage.summary.totalCost)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">By repository</h4>
              {usage.repositories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                  No usage recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {usage.repositories.map((repo) => (
                    <Collapsible
                      key={`${repo.githubFullName}-${repo.workflow}`}
                    >
                      <div className="rounded-lg border">
                        <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40">
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {repo.githubFullName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatNumber(repo.runCount)} runs ·{" "}
                              {formatNumber(repo.distinctItemCount)}{" "}
                              {labels.distinctNoun} ·{" "}
                              {formatNumber(repo.totalTokens)} tokens ·{" "}
                              {formatCostUsd(repo.totalCost)}
                            </p>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 overflow-x-auto">
                            {repo.items.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">
                                {labels.emptyBreakdown}
                              </p>
                            ) : (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b text-left text-muted-foreground">
                                    <th className="py-2 pr-4 font-medium">
                                      {labels.itemHeader}
                                    </th>
                                    <th className="py-2 pr-4 font-medium tabular-nums">
                                      Runs
                                    </th>
                                    <th className="py-2 pr-4 font-medium tabular-nums">
                                      In
                                    </th>
                                    <th className="py-2 pr-4 font-medium tabular-nums">
                                      Out
                                    </th>
                                    <th className="py-2 pr-4 font-medium tabular-nums">
                                      Total
                                    </th>
                                    <th className="py-2 pr-4 font-medium tabular-nums">
                                      Cost
                                    </th>
                                    <th className="py-2 font-medium">
                                      Last run
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {repo.items.map((item) => (
                                    <tr
                                      key={`${item.itemNumber}-${item.workflow}`}
                                      className="border-b border-muted/50 last:border-0"
                                    >
                                      <td className="py-2 pr-4 font-medium">
                                        <a
                                          href={githubItemUrl(
                                            repo.githubFullName,
                                            item.workflow,
                                            item.itemNumber,
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary underline-offset-4 hover:underline"
                                        >
                                          #{item.itemNumber}
                                        </a>
                                      </td>
                                      <td className="py-2 pr-4 tabular-nums">
                                        {formatNumber(item.runCount)}
                                      </td>
                                      <td className="py-2 pr-4 tabular-nums">
                                        {formatNumber(item.totalInputTokens)}
                                      </td>
                                      <td className="py-2 pr-4 tabular-nums">
                                        {formatNumber(item.totalOutputTokens)}
                                      </td>
                                      <td className="py-2 pr-4 tabular-nums">
                                        {formatNumber(item.totalTokens)}
                                      </td>
                                      <td className="py-2 pr-4 tabular-nums">
                                        {formatCostUsd(item.totalCost)}
                                      </td>
                                      <td className="py-2 text-muted-foreground whitespace-nowrap">
                                        {formatDateTime(item.lastRunAt)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
