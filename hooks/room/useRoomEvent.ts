import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export function useRoomEvents(
  userId: string | null,
  setCurrentRoom: (room: any) => void,
  showNotification: (
    type: NotificationType,
    title: string,
    message: string
  ) => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.connect();
  }, []);
  
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (newRoom: any) => {
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
      });
    };

    const handleRoomDeleted = (data: { roomId: string; ownerId: string }) => {
      localStorage.removeItem("current_room");
      setCurrentRoom(null);
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
      });
      showNotification(
        "warning",
        "Room has been deleted",
        "Owner has left the room, room no longer exists."
      );
    };

    const handleMemberLeft = (data: { roomId: string; memberId: string }) => {
      if (data.memberId === userId) {
        localStorage.removeItem("current_room");
        setCurrentRoom(null);
      }
    };

    socket.on("room:created", handleRoomCreated);
    socket.on("room:deleted", handleRoomDeleted);
    socket.on("room:member_left", handleMemberLeft);

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:deleted", handleRoomDeleted);
      socket.off("room:member_left", handleMemberLeft);
    };
  }, [userId, setCurrentRoom, showNotification]);
}
