import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import GitHubConnectionCallback from "@/pages/GitHubConnectionCallback";
import Onboarding from "@/pages/Onboarding";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import PricingSuccess from "@/pages/PricingSuccess";
import Home from "@/pages/Home";
import Coder from "@/pages/agents/Coder";
import Reviewer from "@/pages/agents/Reviewer";
import Connections from "@/pages/Connections";
import Settings from "@/pages/Settings";
import DashboardLayout from "@/components/DashboardLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function CatchAllRedirect() {
  return isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/" replace />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pricing/success" element={<PricingSuccess />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/connections/github/callback"
            element={
              <ProtectedRoute>
                <GitHubConnectionCallback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents/coder"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Coder />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents/reviewer"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Reviewer />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Connections />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
