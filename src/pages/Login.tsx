import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGitHubAuthUrl } from "@/lib/auth";
import { Github } from "lucide-react";

function authErrorMessage(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "missing_token":
      return "We could not complete sign-in. Please try again.";
    default:
      return "Sign-in failed. Please try again or contact support if this keeps happening.";
  }
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const errorMessage = useMemo(
    () => authErrorMessage(searchParams.get("error")),
    [searchParams],
  );

  const handleGitHubLogin = () => {
    window.location.href = getGitHubAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {errorMessage ? (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          <Button
            onClick={handleGitHubLogin}
            className="w-full"
            size="lg"
            variant="default"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
