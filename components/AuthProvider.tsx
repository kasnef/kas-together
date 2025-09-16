"use client";

import { generateUser } from "@/services/api/createUser.api";
import { createContext, useContext, useEffect, useState } from "react";
import { UsernameModal } from "./username-modal";
import { checkCurrentRoom } from "@/services/api/checkCurrentRoom.api";

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
  const [isHaveCurrent, setIsHaveCurrent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const currentRoom = localStorage.getItem("current_room");

        if (currentRoom) {
          setIsHaveCurrent(true);
        } else {
          const token = localStorage.getItem("auth_token");
          if (token && userId) {
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
              localStorage.setItem("current_room", JSON.stringify(newRoomData));
              setIsHaveCurrent(true);
            }
          }
        }
      } catch (err) {
        console.error("Cannot check current room:", err);
      } finally {
        setChecked(true);
      }
    };

    init();
  }, [userId]);

  useEffect(() => {});

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
