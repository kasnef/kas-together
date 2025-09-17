import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function useRoomSocket(roomId: string, userId: string, token: string) {
  const [messages, setMessages] = useState<any[]>([]);

  const [musicState, setMusicState] = useState<{
    playlist: any[];
    currentTrackIndex: number;
    isPlaying: boolean;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (!roomId) return;

    socket.connect();

    socket.emit("join_room", { roomId });

    socket.emit("chat:history", { roomId, limit: 50 });

    socket.on("chat:new", (chat) => {
      setMessages((prev) => [...prev, chat]);
    });

    socket.on("chat:history", (data) => {
      setMessages(() => data.history);
    });

    // --- NEW: Music Listeners ---
    socket.on("music:state_update", (state) => {
      setMusicState(state);
    });

    socket.on("music:playlist_update", ({ playlist }) => {
      setMusicState((prev) => (prev ? { ...prev, playlist } : null));
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("chat:new");
      socket.off("chat:history");
      socket.off("music:state_update");
      socket.off("music:playlist_update");
      socket.disconnect();
    };
  }, [roomId, userId]);

  const sendMessage = (content: string, createdDate: string) => {
    if (!roomId || !userId || !content.trim()) return;

    const chat = {
      roomId,
      userId,
      message: content,
      createdDate,
    };

    socket.emit("send_message", chat);
  };

  // --- NEW: Music Emitters ---
  const syncMusicState = (state: {
    playlist: any[];
    currentTrackIndex: number;
    isPlaying: boolean;
    timestamp: number;
  }) => {
    if (!roomId || !userId) return;
    socket.emit("music:sync_state", { roomId, userId, state });
  };

  const addTrackToRoom = (track: any, clearDefault: boolean) => {
    if (!roomId) return;
    socket.emit("music:add_track", { roomId, track, clearDefault });
  };

  return {
    messages,
    sendMessage,
    musicState,
    syncMusicState,
    addTrackToRoom,
  };
}
