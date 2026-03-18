import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Github,
  Lock,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { api, type CoderAgentSettings, type CoderAgentConfig } from "@/lib/api";
import { Link } from "react-router-dom";

export default function Coder() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery<CoderAgentSettings>({
    queryKey: ["coder-agent-settings"],
    queryFn: async () => {
      const response = await api
        .get("agents/coder/settings")
        .json<CoderAgentSettings>();
      return response;
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: CoderAgentConfig) => {
      await api.put(`agents/coder/repositories/${config.repositoryId}`, {
        json: { enabled: config.enabled, mode: config.mode },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coder-agent-settings"] });
    },
  });

  const getConfig = (repositoryId: number): CoderAgentConfig => {
    const existing = settings?.configurations.find(
      (c) => c.repositoryId === repositoryId,
    );
    return existing || { repositoryId, enabled: false, mode: "on_assignment" };
  };

  const handleToggle = (repositoryId: number, enabled: boolean) => {
    const config = getConfig(repositoryId);
    updateConfigMutation.mutate({ ...config, enabled });
  };

  const handleModeChange = (
    repositoryId: number,
    mode: "auto" | "on_assignment",
  ) => {
    const config = getConfig(repositoryId);
    updateConfigMutation.mutate({ ...config, mode });
  };

  const filteredRepositories =
    settings?.repositories.filter(
      (repo) =>
        repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const enabledCount =
    settings?.configurations.filter((c) => c.enabled).length || 0;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coder Agent</h2>
          <p className="text-muted-foreground">
            AI-powered coding assistant for your development workflow
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">
                  Unable to load repositories
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Please connect your GitHub App to enable the Coder Agent.
                </p>
              </div>
              <Button asChild>
                <Link to="/connections">
                  <Github className="mr-2 h-4 w-4" />
                  Connect GitHub
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Coder Agent</h2>
        <p className="text-muted-foreground">
          Configure the Coder Agent for your repositories
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings?.repositories.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accessible repositories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enabledCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agent is active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Auto Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {settings?.configurations.filter(
                (c) => c.enabled && c.mode === "auto",
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automatic responses
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Repository Configuration</CardTitle>
              <CardDescription>
                Enable the Coder Agent and set the response mode for each
                repository
              </CardDescription>
            </div>
          </div>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No repositories match your search."
                  : "No repositories available."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRepositories.map((repo) => {
                const config = getConfig(repo.id);
                const isUpdating =
                  updateConfigMutation.isPending &&
                  updateConfigMutation.variables?.repositoryId === repo.id;

                return (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1">
                        {repo.private ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Github className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">
                            {repo.fullName}
                          </h4>
                          {config.enabled && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {repo.language && (
                            <span className="text-xs text-muted-foreground">
                              {repo.language}
                            </span>
                          )}
                          {repo.updatedAt && (
                            <span className="text-xs text-muted-foreground">
                              Updated{" "}
                              {new Date(repo.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex items-center gap-2">
                        <Select
                          value={config.mode}
                          onValueChange={(value: "auto" | "on_assignment") =>
                            handleModeChange(repo.id, value)
                          }
                          disabled={!config.enabled || isUpdating}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="on_assignment">
                              On Assignment
                            </SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) =>
                              handleToggle(repo.id, checked)
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Mode Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">On Assignment:</span>
            <span className="text-muted-foreground ml-2">
              The agent will only respond when explicitly assigned to an issue
              in the repository.
            </span>
          </div>
          <div>
            <span className="font-semibold">Auto:</span>
            <span className="text-muted-foreground ml-2">
              The agent will automatically respond to all new issues in the
              repository.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
