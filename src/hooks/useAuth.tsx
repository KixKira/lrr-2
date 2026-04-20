import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { sendConfirmationEmail } from "@/services/email";

type AppRole = "admin" | "professional" | "patient";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

type UserMeta = Record<string, string>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  isPatient: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── helpers (module-level, no hooks) ────────────────────────────────────────

const ensurePatientRole = async (userId: string) => {
  const { data: existing } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!existing || existing.length === 0) {
    await supabase.from("user_roles").insert({ user_id: userId, role: "patient" });
  }
};

const createProfile = async (
  userId: string,
  email: string,
  meta?: UserMeta,
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      email,
      first_name: meta?.first_name ?? null,
      last_name: meta?.last_name ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  await ensurePatientRole(userId);
  return data as Profile;
};

const backfillNames = (userId: string, meta: UserMeta, existing: Profile) => {
  const updates: Partial<Profile> = {};
  if (!existing.first_name && meta.first_name) updates.first_name = meta.first_name;
  if (!existing.last_name && meta.last_name) updates.last_name = meta.last_name;
  if (Object.keys(updates).length === 0) return;

  // Fire-and-forget: update the DB in the background, don't block the UI
  supabase.from("profiles").update(updates).eq("user_id", userId);
};

const fetchProfile = async (
  userId: string,
  userEmail?: string,
  meta?: UserMeta,
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  if (!data) return userEmail ? createProfile(userId, userEmail, meta) : null;

  const profile = data as Profile;

  if (meta && (!profile.first_name || !profile.last_name)) {
    backfillNames(userId, meta, profile); // fire-and-forget
    return {
      ...profile,
      first_name: profile.first_name ?? meta.first_name ?? null,
      last_name: profile.last_name ?? meta.last_name ?? null,
    };
  }

  return profile;
};

const fetchRoles = async (userId: string): Promise<AppRole[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  return data.map((r) => r.role as AppRole);
};

// ── provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessionUser = async (sessionUser: User) => {
    const meta = sessionUser.user_metadata as UserMeta | undefined;
    const [profileData, rolesData] = await Promise.all([
      fetchProfile(sessionUser.id, sessionUser.email, meta),
      fetchRoles(sessionUser.id),
    ]);
    setUser(sessionUser);
    setProfile(profileData);
    setRoles(rolesData);
  };

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      console.log("🔄 Cargando sesión...");

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) console.error("❌ Error al cargar sesión:", error);

      if (session?.user) {
        console.log("✅ Sesión encontrada:", session.user.email);
        await loadSessionUser(session.user);
      } else {
        console.log("ℹ️ No hay sesión activa");
      }

      setIsLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) await loadSessionUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setRoles([]);
        }
      },
    );

    return () => { subscription.unsubscribe(); };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: Error | null }> => {
    console.log("🔐 signIn iniciado para:", email);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("❌ Error en signIn:", error.message);
      return { error: new Error(error.message) };
    }

    console.log("✅ signIn exitoso:", data.user?.email);
    if (data.user) await loadSessionUser(data.user);

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{ error: Error | null; confirmationRequired?: boolean }> => {
    console.log("📝 signUp iniciado para:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
      },
    });

    if (error) {
      console.error("❌ Error en signUp:", error.message);
      return { error: new Error(error.message) };
    }

    console.log("✅ signUp exitoso:", data.user?.email);

    if (data.user?.confirmation_sent_at) {
      const confirmationUrl = `${window.location.origin}/auth?confirmation_token=${data.user.id}`;
      const { success, error: emailError } = await sendConfirmationEmail(
        email,
        confirmationUrl,
        firstName,
      );
      if (!success) console.error("❌ Error enviando email:", emailError);
      else console.log("✅ Email de confirmación enviado");
    }

    // Profile is created by the DB trigger with first_name/last_name from metadata.
    // If sign-up skipped email confirmation (session exists), load profile now.
    if (data.session && data.user) await loadSessionUser(data.user);

    return { error: null, confirmationRequired: !data.session };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setRoles([]);
    await supabase.auth.signOut({ scope: "local" });
  };

  const refreshProfile = async () => {
    if (user) {
      const meta = user.user_metadata as UserMeta | undefined;
      const profileData = await fetchProfile(user.id, user.email, meta);
      setProfile(profileData);
    }
  };

  const updateProfile = (data: Partial<Profile>) => {
    if (profile) setProfile({ ...profile, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isLoading,
        isAdmin: roles.includes("admin"),
        isProfessional: roles.includes("professional"),
        isPatient: roles.includes("patient"),
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
