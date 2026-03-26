import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkflowUsagePanel } from "@/components/WorkflowUsagePanel";
import { FileCheck, Github } from "lucide-react";
import { Link } from "react-router-dom";

export default function Reviewer() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reviewer Agent</h2>
        <p className="text-muted-foreground">
          AI-powered code review on pull requests. Install the GitHub App under{" "}
          <Link to="/connections" className="text-primary underline-offset-4 hover:underline">
            Connections
          </Link>{" "}
          so the reviewer can access your repositories.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Agent status
            </CardTitle>
            <CardDescription>
              The reviewer runs when triggered on pull requests in connected repos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/connections">
                <Github className="mr-2 h-4 w-4" />
                Manage GitHub connection
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <WorkflowUsagePanel
        workflow="review"
        queryKeyPrefix="reviewer-agent"
        cardDescription="Runs, tokens, and cost for PR review workflows"
      />
    </div>
  );
}
