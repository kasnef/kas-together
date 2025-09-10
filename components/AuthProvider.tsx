"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; username: string } | null;

const AuthContext = createContext<{
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    //TODO gọi hook api check me chỗ này
  }, []);

  function logout() {
    localStorage.removeItem("auth_token");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
