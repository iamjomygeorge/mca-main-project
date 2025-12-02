"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async (accessToken) => {
    try {
      const userData = await api.get("/api/users/me", { token: accessToken });
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Session expired or invalid");
        }

        const data = await response.json();

        if (data.token) {
          setToken(data.token);
          await fetchUser(data.token);
        }
      } catch (error) {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [fetchUser]);

  const login = (newToken) => {
    setToken(newToken);
    fetchUser(newToken).then(() => {
      router.push("/");
    });
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = useCallback(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
