import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useRoomSocket(roomId: string, userId: string) {
  useEffect(() => {
    if (!roomId) return;

    socket.connect();

    socket.emit("join_room", { roomId });

    socket.on("chat:new", (chat) => {
      console.log("Tin nhắn mới:", chat);
    });

    socket.on("chat:history", (data) => {
      console.log("Lịch sử chat:", data.history);
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("chat:new");
      socket.off("chat:history");
      socket.disconnect();
    };
  }, [roomId, userId]);

  return socket;
}
