// stores/useRoomMusicStore.ts

import type { Song } from "@/data/music-playlist";
import { create } from "zustand";

// --- CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU ---

// Dùng chung cho cả lần đầu và các lần cập nhật sau
export interface StateChangePayload {
  playlist?: Song[];
  currentTrackIndex?: number;
  isPlaying?: boolean;
  timestamp?: number;
}

// *** SỬA LỖI Ở ĐÂY: Cập nhật định nghĩa SocketEmitters ***
// Định nghĩa mới này khớp chính xác với các hàm mà useRoomMusicSync tạo ra.
type SocketEmitters = {
  requestStateChange: (state: StateChangePayload) => void;
  requestAddTrack: (track: Song, clearDefault: boolean) => void;
};

// Trạng thái đồng bộ từ server
type SyncedMusicState = {
  syncedPlaylist: Song[];
  syncedCurrentIndex: number;
  syncedIsPlaying: boolean;
  syncedTimestamp: number;
};

// Toàn bộ state của store
type StoreState = SyncedMusicState & {
  isOwner: boolean;
  isInRoom: boolean;
  emitters: SocketEmitters | null; // Giờ đây nó sẽ chấp nhận kiểu mới

  // Actions
  setRoomSyncState: (
    state: Partial<SyncedMusicState & { isOwner: boolean; isInRoom: boolean }>
  ) => void;
  setSocketEmitters: (emitters: SocketEmitters) => void;
  clearRoomSyncState: () => void;
};

// --- IMPLEMENTATION CỦA STORE ---

const initialState: SyncedMusicState = {
  syncedPlaylist: [],
  syncedCurrentIndex: 0,
  syncedIsPlaying: false,
  syncedTimestamp: 0,
};

export const useRoomMusicStore = create<StoreState>((set) => ({
  ...initialState,
  isOwner: false,
  isInRoom: false,
  emitters: null,

  setRoomSyncState: (state) => set((prevState) => ({ ...prevState, ...state })),
  setSocketEmitters: (emitters) => set({ emitters }), // Sẽ không còn lỗi ở đây
  clearRoomSyncState: () =>
    set({ ...initialState, isOwner: false, isInRoom: false, emitters: null }),
}));
