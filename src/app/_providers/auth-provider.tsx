"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { parseCookies } from "nookies"; // Use nookies for cookie parsing
import { setAuthCookie, clearAuthCookie } from "~/lib/auth"; // Adjust the import path as necessary
import { type User } from "~/server/db/models/user"; // Adjust based on your User model
import { verifyToken } from "../api/auth/verify-jwt";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // const utils = api.useUtils();

  const {
    data,
    // error,
  } = api.auth.getMe.useQuery(undefined, {
    enabled: !!parseCookies().auth, // Only run query if token exists
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies.auth;
        if (token) {
          const decoded = await verifyToken(token);
          if (decoded && data?.user) {
            setUser(data.user as User);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void initializeAuth();
  }, [data]);

  const register = async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      const mutation = api.auth.register.useMutation({
        onSuccess: ({ token, user }) => {
          document.cookie = setAuthCookie(token); // Consider server-side setting
          setUser(user as User);
          router.push("/dashboard");
        },
        onError: (error) => console.error("Registration error:", error),
      });
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    try {
      const mutation = api.auth.login.useMutation({
        onSuccess: ({ token, user }) => {
          document.cookie = setAuthCookie(token); // Consider server-side setting
          setUser(user as User);
          router.push("/dashboard");
        },
        onError: (error) => console.error("Login error:", error),
      });
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    document.cookie = clearAuthCookie(); // Consider server-side clearing
    setUser(null);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
