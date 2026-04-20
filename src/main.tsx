import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Initialize Supabase client and check for existing session before rendering
const initializeApp = async () => {
  // Pre-load session to prevent flash of unauthenticated content
  await supabase.auth.getSession();

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
};

initializeApp();
