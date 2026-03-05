import { useState, createContext, useContext, ReactNode } from "react";

type AppRole = "admin" | "professional" | "patient";

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
}

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

// Mock users — María José Marquina is the sole professional & admin
const mockUsers: Record<
  string,
  { password: string; roles: AppRole[]; profile: Profile }
> = {
  "mariajose@lrr.com": {
    password: "admin123",
    roles: ["admin", "professional"],
    profile: {
      id: "1",
      user_id: "1",
      email: "mariajose@lrr.com",
      first_name: "María José",
      last_name: "Marquina",
      phone: "+1234567890",
      avatar_url:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
      bio: "Psicóloga clínica especializada en ansiedad, depresión y bienestar emocional.",
    },
  },
  "paciente@lrr.com": {
    password: "patient123",
    roles: ["patient"],
    profile: {
      id: "2",
      user_id: "2",
      email: "paciente@lrr.com",
      first_name: "Juan",
      last_name: "Pérez",
      phone: "+1234567892",
      avatar_url: null,
      bio: "Buscando mejorar mi bienestar mental",
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = mockUsers[email.toLowerCase()];

    if (!mockUser || mockUser.password !== password) {
      setIsLoading(false);
      return { error: new Error("Invalid login credentials") };
    }

    setUser({ id: mockUser.profile.user_id, email });
    setProfile(mockUser.profile);
    setRoles(mockUser.roles);
    setIsLoading(false);

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mockUsers[email.toLowerCase()]) {
      setIsLoading(false);
      return { error: new Error("User already registered") };
    }

    const newUserId = Date.now().toString();
    const newProfile: Profile = {
      id: newUserId,
      user_id: newUserId,
      email,
      first_name: firstName || null,
      last_name: lastName || null,
      phone: null,
      avatar_url: null,
      bio: null,
    };

    mockUsers[email.toLowerCase()] = {
      password,
      roles: ["patient"],
      profile: newProfile,
    };

    setIsLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setRoles([]);
  };

  const refreshProfile = async () => {};

  const updateProfile = (data: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  const isAdmin = roles.includes("admin");
  const isProfessional = roles.includes("professional");
  const isPatient = roles.includes("patient");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isLoading,
        isAdmin,
        isProfessional,
        isPatient,
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

export const mockCredentials = {
  admin: {
    email: "mariajose@lrr.com",
    password: "admin123",
    label: "María José (Admin)",
  },
  patient: {
    email: "paciente@lrr.com",
    password: "patient123",
    label: "Paciente",
  },
};
