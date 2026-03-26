import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type OnboardingData } from "@/lib/api";

export default function Onboarding() {
  const navigate = useNavigate();

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      return api
        .post("onboarding", {
          json: data,
        })
        .json();
    },
    onSuccess: () => {
      navigate("/");
    },
    onError: (error) => {
      console.error("Onboarding failed:", error);
    },
  });

  const form = useForm({
    defaultValues: {
      organization: "",
      username: "",
      fullName: "",
      bio: "",
    },
    onSubmit: async ({ value }) => {
      onboardingMutation.mutate(value);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Let's set up your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="organization"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 2) {
                    return "Organization name must be at least 2 characters";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="organization">
                    Organization Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="organization"
                    placeholder="Acme Inc."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 3) {
                    return "Username must be at least 3 characters";
                  }
                  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                    return "Username can only contain letters, numbers, underscores, and hyphens";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="fullName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="bio"
              validators={{
                onChange: ({ value }) => {
                  if (value && value.length > 160) {
                    return "Bio must be 160 characters or less";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <p className="text-xs text-muted-foreground">
                    {field.state.value.length}/160 characters
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    !canSubmit || isSubmitting || onboardingMutation.isPending
                  }
                >
                  {onboardingMutation.isPending
                    ? "Setting up..."
                    : "Complete Setup"}
                </Button>
              )}
            </form.Subscribe>

            {onboardingMutation.isError && (
              <p className="text-sm text-destructive text-center">
                Failed to complete onboarding. Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
