"use client";

import type React from "react";

import { generateUser } from "@/services/api/createUser.api";
import { createContext, useContext, useEffect, useState } from "react";
import { UsernameModal } from "./username-modal";
import { checkCurrentRoom } from "@/services/api/checkCurrentRoom.api";

type User = { id: string; username: string } | null;

interface AuthContextType {
  userToken: string | null;
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
  const [isHaveCurrent, setIsHaveCurrent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("user_id");
      const storedToken = localStorage.getItem("auth_token");
      if (storedId) {
        setUserId(storedId);
      }
      if (storedToken) {
        setAuthToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const currentRoom =
          typeof window !== "undefined"
            ? localStorage.getItem("current_room")
            : null;

        if (currentRoom) {
          setIsHaveCurrent(true);
        } else {
          if (authToken && userId) {
            const check = await checkCurrentRoom(userId);
            const newRoomData = {
              room_id: check.room.id,
              room_name: check.room.name,
              room_description: check.room.description,
              room_type: check.room.type,
              room_password: check.room.password ?? null,
              room_createdAt: check.room.createdAt ?? "",
              room_ownerId: check.room.ownerId ?? "",
              memberCount: check.members?.length ?? 0,
            };
            if (check) {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "current_room",
                  JSON.stringify(newRoomData)
                );
              }
              setIsHaveCurrent(true);
            }
          }
        }
      } catch (err) {
        console.error("Cannot check current room:", err);
      } finally {
        setChecked(true);
        if (!authToken) {
          const hasVisited =
            typeof window !== "undefined"
              ? localStorage.getItem("hasVisitedBefore")
              : null;
          if (hasVisited) {
            setShowUsernameModal(true);
          } else {
            setTimeout(() => {
              setShowUsernameModal(true);
            }, 500);
          }
        }
      }
    };

    init();
  }, [userId, authToken]);

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    setUser(null);
    setAuthToken(null);
  }

  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
      {!authToken && showUsernameModal && (
        <UsernameModal
          onSubmit={async (username) => {
            const genUser = await generateUser(username);
            if (!genUser) {
              console.log("Error when creating user!");
              return;
            }
            if (typeof window !== "undefined") {
              localStorage.setItem("user_id", genUser.id);
              localStorage.setItem("auth_token", genUser.token);
            }
            setAuthToken(genUser.token);
            setUserId(genUser.id);
            setShowUsernameModal(false);
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
