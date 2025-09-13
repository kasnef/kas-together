"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UsernameModal } from "./username-modal";
import { generateUser } from "@/services/api/createUser.api";

type User = { id: string; username: string } | null;

interface AuthContextType {
  userToken: string;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<{
  logout: () => void;
}>({
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
    }
    setChecked(true);
  }, []);

  function logout() {
    localStorage.removeItem("auth_token");
    setUser(null);
  }

  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
      {!localStorage.getItem("auth_token") && (
        <UsernameModal
          onSubmit={async (username) => {
            const genUser = await generateUser(username);
            if (!genUser) {
              console.log("Error when creating user!");
            }
            localStorage.setItem("user_id", genUser?.id);
            localStorage.setItem("auth_token", genUser?.token);
          }}
          forceOpen
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
