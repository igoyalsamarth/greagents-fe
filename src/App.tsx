import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import GitHubConnectionCallback from "@/pages/GitHubConnectionCallback";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import PricingSuccess from "@/pages/PricingSuccess";
import Home from "@/pages/Home";
import Coder from "@/pages/agents/Coder";
import Reviewer from "@/pages/agents/Reviewer";
import Connections from "@/pages/Connections";
import SettingsBilling from "@/pages/SettingsBilling";
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

const SITE_NAME = "GreAgents";
const DEFAULT_TITLE = `${SITE_NAME} — AI agents for your GitHub workflow`;

function documentTitleForPath(pathname: string): string {
  switch (pathname) {
    case "/":
      return DEFAULT_TITLE;
    case "/pricing":
      return `Pricing — ${SITE_NAME}`;
    case "/pricing/success":
      return `Subscription confirmed — ${SITE_NAME}`;
    case "/login":
      return `Log in — ${SITE_NAME}`;
    case "/dashboard":
      return `Dashboard — ${SITE_NAME}`;
    case "/agents/coder":
      return `Coder agent — ${SITE_NAME}`;
    case "/agents/reviewer":
      return `Reviewer agent — ${SITE_NAME}`;
    case "/connections":
      return `Connections — ${SITE_NAME}`;
    case "/settings/billing":
      return `Wallet & billing — ${SITE_NAME}`;
    case "/connections/github/callback":
      return `Connecting GitHub — ${SITE_NAME}`;
    case "/auth/callback":
      return `Signing in — ${SITE_NAME}`;
    default:
      return DEFAULT_TITLE;
  }
}

function DocumentTitle() {
  const location = useLocation();
  useEffect(() => {
    document.title = documentTitleForPath(location.pathname);
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DocumentTitle />
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
            path="/settings/billing"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsBilling />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
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
