import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, Play } from 'lucide-react';

export default function Reviewer() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reviewer Agent</h2>
        <p className="text-muted-foreground">
          AI-powered code review assistant for quality assurance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Agent Status
            </CardTitle>
            <CardDescription>
              Current state of the reviewer agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm text-muted-foreground">Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Review</span>
                <span className="text-sm text-muted-foreground">5 hours ago</span>
              </div>
              <Button className="w-full" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Review Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              Latest code reviews completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent reviews to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
