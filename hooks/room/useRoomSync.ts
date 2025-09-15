// hooks/useRoomMusicSync.ts
import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { useRoomMusicStore } from "@/store/useMusicStore";
import type { Song } from "@/data/music-playlist";
// ... (imports các kiểu dữ liệu)

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
        "CLIENT: Handler is executing with latest state. Received:",
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

    // --- EMITTERS: Gửi YÊU CẦU lên server ---
    const emitters = {
      requestStateChange: (state: any) => {
        console.log("CLIENT: Requesting state change:", state);
        socket.emit("music:sync_state", { roomId, userId, state });
      },
      requestAddTrack: (track: Song, clearDefault: boolean) => {
        console.log("CLIENT: Requesting to add track:", track);
        socket.emit("music:add_track", { roomId, track, clearDefault });
      },
    };
    setSocketEmitters(emitters);

    const socketListener = (stateFromServer: any) => {
      handleStateUpdateRef.current(stateFromServer);
    };

    socket.on("music:state_update", socketListener);

    // --- YÊU CẦU TRẠNG THÁI BAN ĐẦU ---
    // Đây là "Cú Bắt Tay" quan trọng nhất.
    console.log("CLIENT: Requesting initial music state for room", roomId);
    socket.emit("music:get_initial_state", { roomId, userId });

    return () => {
      console.log("CLIENT: Cleaning up music listeners.");
      socket.off("music:state_update", socketListener);
      clearRoomSyncState();
    };
  }, [roomId, userId, setSocketEmitters, clearRoomSyncState]);
};
