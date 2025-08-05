import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Certificates from "@/pages/certificates";
import Documents from "@/pages/documents";
import Users from "@/pages/users";
import Notifications from "@/pages/notifications";
import Manuals from "@/pages/manuals";
import Logs from "@/pages/logs";
import Kpi from "@/pages/kpi";
import ShipDetails from "@/pages/ship-details";
import { Sidebar } from "@/components/layout/sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Dashboard />
        </div>
      )} />
      <ProtectedRoute path="/certificates" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Certificates />
        </div>
      )} />
      <ProtectedRoute path="/documents/:tab?" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Documents />
        </div>
      )} />
      <ProtectedRoute path="/users" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Users />
        </div>
      )} />
      <ProtectedRoute path="/notifications" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Notifications />
        </div>
      )} />
      <ProtectedRoute path="/manuals" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Manuals />
        </div>
      )} />
      <ProtectedRoute path="/logs" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Logs />
        </div>
      )} />
      <ProtectedRoute path="/kpi" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <Kpi />
        </div>
      )} />
      <ProtectedRoute path="/ships/:id" component={() => (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <ShipDetails />
        </div>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
