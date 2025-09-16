export interface RoomPlaylistState {
  playlist: Array<{
    id: string
    title: string
    artist: string
    url: string
  }>
  currentTrackIndex: number
  isPlaying: boolean
  timestamp: number
  ownerId: string
}

export interface RoomPlaylist {
  id: string
  roomId: string
  playlist: Array<{
    id: string
    title: string
    artist: string
    url: string
  }>
  currentTrackIndex: number
  isPlaying: boolean
  timestamp: number
  ownerId: string
  createdAt: Date
  updatedAt: Date
}
