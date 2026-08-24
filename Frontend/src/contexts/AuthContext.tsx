"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "startup" | "investor" | "admin";
  full_name: string;
  phone?: string;
  status: "active" | "pending" | "suspended";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  impersonate: (token: string, user: User) => void;
  stopImpersonating: () => void;
  isAdminImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on mount
    const storedToken = localStorage.getItem("axiom_access_token");
    const storedUser = localStorage.getItem("axiom_user");
    const storedAdminToken = localStorage.getItem("axiom_admin_token");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedAdminToken) {
          setIsAdminImpersonating(true);
        }
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("axiom_access_token", newToken);
    localStorage.setItem("axiom_user", JSON.stringify(newUser));
  };

  const impersonate = (newToken: string, newUser: User) => {
    // 1. Back up the original admin session (only if we are not already impersonating)
    if (!isAdminImpersonating && token && user) {
      localStorage.setItem("axiom_admin_token", token);
      localStorage.setItem("axiom_admin_user", JSON.stringify(user));
    }
    
    // 2. Set the impersonated user session
    setToken(newToken);
    setUser(newUser);
    setIsAdminImpersonating(true);
    localStorage.setItem("axiom_access_token", newToken);
    localStorage.setItem("axiom_user", JSON.stringify(newUser));
  };

  const stopImpersonating = () => {
    const adminToken = localStorage.getItem("axiom_admin_token");
    const adminUser = localStorage.getItem("axiom_admin_user");

    if (adminToken && adminUser) {
      try {
        const parsedAdminUser = JSON.parse(adminUser);
        setToken(adminToken);
        setUser(parsedAdminUser);
        setIsAdminImpersonating(false);
        localStorage.setItem("axiom_access_token", adminToken);
        localStorage.setItem("axiom_user", adminUser);
        
        // Remove admin backups
        localStorage.removeItem("axiom_admin_token");
        localStorage.removeItem("axiom_admin_user");

        // Redirect back to admin members view
        router.push("/admin/dashboard/users");
      } catch (e) {
        console.error("Failed to restore admin session", e);
        logout();
      }
    } else {
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAdminImpersonating(false);
    localStorage.removeItem("axiom_access_token");
    localStorage.removeItem("axiom_user");
    localStorage.removeItem("axiom_admin_token");
    localStorage.removeItem("axiom_admin_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isLoading,
      impersonate,
      stopImpersonating,
      isAdminImpersonating
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
