import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Appointments from "./pages/Appointments";
import Professionals from "./pages/Professionals";
import Shop from "./pages/Shop";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import PatientProfile from "./pages/PatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
          <Route path="/professional-dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
