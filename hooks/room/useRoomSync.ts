"use client";

// hooks/useRoomMusicSync.ts
import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { useRoomMusicStore } from "@/store/useMusicStore";
import type { Song } from "@/data/music-playlist";

export const useRoomMusicSync = (
  roomId: string | null,
  userId: string | null
) => {
  const setRoomSyncState = useRoomMusicStore((state) => state.setRoomSyncState);
  const setSocketEmitters = useRoomMusicStore(
    (state) => state.setSocketEmitters
  );
  const clearRoomSyncState = useRoomMusicStore(
    (state) => state.clearRoomSyncState
  );

  const handleStateUpdateRef = useRef((_stateFromServer: any) => {});

  useEffect(() => {
    handleStateUpdateRef.current = (stateFromServer: any) => {
      console.log(
        "[v0] CLIENT: Handler is executing with latest state. Received:",
        stateFromServer
      );
      setRoomSyncState({
        syncedPlaylist: stateFromServer.playlist || [],
        syncedCurrentIndex: stateFromServer.currentIndex || 0,
        syncedIsPlaying: stateFromServer.isPlaying || false,
        syncedTimestamp: stateFromServer.timestamp || 0,
        isOwner: stateFromServer.ownerId === userId,
        isInRoom: true,
      });
    };
  }, [userId, setRoomSyncState]);

  useEffect(() => {
    if (!roomId || !userId) {
      if (socket.connected) {
        clearRoomSyncState();
      }
      return;
    }
    if (!socket.connected) socket.connect();

    const emitters = {
      requestStateChange: (state: any) => {
        console.log("[v0] CLIENT: Requesting state change:", state);
        if (socket.connected) {
          socket.emit("music:sync_state", { roomId, userId, state });
        } else {
          console.error("[v0] CLIENT: Socket not connected, cannot sync state");
        }
      },
      requestAddTrack: (track: Song, clearDefault: boolean) => {
        console.log("[v0] CLIENT: Requesting to add track:", track);
        if (socket.connected) {
          socket.emit("music:add_track", { roomId, track, clearDefault });
        } else {
          console.error("[v0] CLIENT: Socket not connected, cannot add track");
        }
      },
    };
    setSocketEmitters(emitters);

    const socketListener = (stateFromServer: any) => {
      handleStateUpdateRef.current(stateFromServer);
    };

    const handleConnect = () => {
      console.log("[v0] CLIENT: Socket connected, requesting initial state");
      socket.emit("music:get_initial_state", { roomId, userId });
    };

    const handleDisconnect = () => {
      console.log("[v0] CLIENT: Socket disconnected");
    };

    const handleConnectError = (error: any) => {
      console.error("[v0] CLIENT: Socket connection error:", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("music:state_update", socketListener);

    // Request initial state if already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      console.log("[v0] CLIENT: Cleaning up music listeners.");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("music:state_update", socketListener);
      clearRoomSyncState();
    };
  }, [roomId, userId, setSocketEmitters, clearRoomSyncState]);
};
