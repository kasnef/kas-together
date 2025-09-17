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
    if (!socket) return;

    const handleRoomCreated = (newRoom: any) => {
      console.log("Room created", newRoom);
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
      });
    };

    const handleRoomListUpdated = (data: {
      roomId: string;
      action: string;
    }) => {
      console.log("Room list updated", data);
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
        refetchType: "active",
      });
    };

    const handleRoomDeleted = (data: { roomId: string; ownerId: string }) => {
      localStorage.removeItem("current_room");
      setCurrentRoom(null);
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
        refetchType: "active",
      });
      showNotification(
        "warning",
        "Room has been deleted",
        "Owner has left the room, room no longer exists."
      );
    };

    const handleMemberJoined = (data: { roomId: string; member: any }) => {
      queryClient.invalidateQueries({
        queryKey: ["room_detail", data.roomId],
      });
    };

    const handleMemberLeft = (data: { roomId: string; memberId: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["room_detail", data.roomId],
      });
      if (data.memberId === userId) {
        localStorage.removeItem("current_room");
        setCurrentRoom(null);
      }
    };
    socket.on("room:created", handleRoomCreated);
    socket.on("room:list_updated", handleRoomListUpdated);
    socket.on("room:deleted", handleRoomDeleted);
    socket.on("room:user_join", handleMemberJoined);
    socket.on("room:user_left", handleMemberLeft);

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:list_updated", handleRoomListUpdated);
      socket.off("room:deleted", handleRoomDeleted);
      socket.off("room:user_join", handleMemberJoined);
      socket.off("room:user_left", handleMemberLeft);
    };
  }, [userId, setCurrentRoom, showNotification]);
}
