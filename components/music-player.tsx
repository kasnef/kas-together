"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getRandomPlaylist, type Song } from "@/data/music-playlist";
import {
  ChevronUp,
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGenericStore } from "@/store/useStore";
import { AddSongModal } from "./add-song-modal";
import { PlaylistModal } from "./playlist-modal";
import endpoint from "@/services/endpoint";
import { getYtInfo } from "@/services/api/getYtInfo.api";
import { useRoomMusicStore } from "@/store/useMusicStore";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface MusicPlayerProps {
  onTrackChange?: (track: Track | null) => void;
}

export function MusicPlayer({ onTrackChange }: MusicPlayerProps) {
  const [initialPlaylist] = useState(() => getRandomPlaylist());
  const setSimpleItem = useGenericStore((state) => state.setSimpleItem);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist.playlist);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hasUserTracks, setHasUserTracks] = useState(false);

  const {
    syncedPlaylist,
    syncedCurrentIndex,
    syncedIsPlaying,
    syncedTimestamp,
    isOwner,
    isInRoom,
    emitters,
  } = useRoomMusicStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isInRoom && !isOwner) {
      if (JSON.stringify(playlist) !== JSON.stringify(syncedPlaylist)) {
        console.log("MEMBER: Syncing playlist from server.");
        setPlaylist(syncedPlaylist);
      }

      const serverTrack = syncedPlaylist[syncedCurrentIndex] || null;
      if (currentTrack?.id !== serverTrack?.id) {
        console.log("MEMBER: Syncing current track to:", serverTrack?.title);
        setCurrentTrack(serverTrack);
      }

      if (isPlaying !== syncedIsPlaying) {
        console.log("MEMBER: Syncing isPlaying state to:", syncedIsPlaying);
        setIsPlaying(syncedIsPlaying);
      }

      // 4. Ghi đè trực tiếp timestamp lên audio element
      const audio = audioRef.current;
      if (audio) {
        const timeDiff = Math.abs(audio.currentTime - syncedTimestamp);
        if (timeDiff > 2.5) {
          console.log(`MEMBER: Resyncing time to ${syncedTimestamp}`);
          audio.currentTime = syncedTimestamp;
        }
      }
    }
  }, [
    isInRoom,
    isOwner,
    syncedPlaylist,
    syncedCurrentIndex,
    syncedIsPlaying,
    syncedTimestamp,
  ]);

  // --- STATE CỤC BỘ: Chỉ dùng khi KHÔNG ở trong phòng ---
  const [localPlaylist, setLocalPlaylist] = useState<Song[]>(
    () => getRandomPlaylist().playlist
  );
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [localCurrentIndex, setLocalCurrentIndex] = useState(0);

  const playlistToUse = isInRoom ? syncedPlaylist : localPlaylist;
  const isPlayingToUse = isInRoom ? syncedIsPlaying : localIsPlaying;
  const currentIndexToUse = isInRoom ? syncedCurrentIndex : localCurrentIndex;
  const audiocurrentTrack = playlistToUse[currentIndexToUse] || null;

  // control audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack && (!audio.src || !audio.src.includes(currentTrack.url))) {
      audio.src = `${process.env.NEXT_PUBLIC_DEV_API_URL}${endpoint.stream_music}?url=${currentTrack.url}`;
      audio.load();
    }
    if (!currentTrack && audio.src) {
      audio.src = "";
    }

    if (isPlayingToUse && audio.paused) {
      audio.play().catch((e) => {});
    } else if (!isPlayingToUse && !audio.paused) {
      audio.pause();
    }

    if (isInRoom && !isOwner) {
      const timeDiff = Math.abs(audio.currentTime - syncedTimestamp);
      if (timeDiff > 2.5) {
        audio.currentTime = syncedTimestamp;
      }
    }
  }, [currentTrack, isPlayingToUse, isInRoom, isOwner, syncedTimestamp]);

  // report local status for room system
  useEffect(() => {
    if (!isInRoom) {
      localStorage.setItem(
        "localMusicState",
        JSON.stringify({
          playlist: localPlaylist,
          currentIndex: localCurrentIndex,
        })
      );
    }
  }, [localPlaylist, localCurrentIndex, isInRoom]);

  // play music when clicked anywhere
  useEffect(() => {
    const enableAudio = () => {
      if (audioRef.current && currentTrack) {
        audioRef.current.muted = false;
        audioRef.current.play().catch((err) => {});
      }
      document.removeEventListener("click", enableAudio);
    };

    document.addEventListener("click", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (initialPlaylist.playlist.length > 0 && !hasUserTracks) {
      setCurrentTrack(initialPlaylist.playlist[0]);
      setCurrentIndex(0);
      setSimpleItem({ name: initialPlaylist.videoPlaylistKey });
    }
  }, [initialPlaylist.playlist]);

  useEffect(() => {
    onTrackChange?.(currentTrack);
  }, [currentTrack, onTrackChange]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  const handlePlayPause = () => {
    if (isInRoom) {
      if (!isOwner || !emitters || !audioRef.current) return;
      emitters.requestStateChange({
        isPlaying: !syncedIsPlaying,
        timestamp: audioRef.current.currentTime,
      });
    } else {
      setLocalIsPlaying(!localIsPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100; // từ 0.0 → 1.0
      if (value[0] > 0) {
        audioRef.current.muted = false; // tự bỏ mute nếu có volume
        setIsMuted(false);
      }
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleAddTrack = async (url: string) => {
    const cleanUrl = url.replace(/&.*$/, "");
    if (!cleanUrl.trim()) return;

    try {
      const info: Track = await getYtInfo(url);

      const newTrack: Track = {
        id: info?.id,
        title: info.title,
        artist: info.artist,
        url: url,
      };

      if (hasUserTracks) {
        setPlaylist((prevPlaylist) => [...prevPlaylist, newTrack]);
      } else {
        setPlaylist([newTrack]);
        setHasUserTracks(true);
        setCurrentTrack(newTrack);
        setCurrentIndex(0);
        setIsPlaying(true);

        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current
              .play()
              .catch((e) => console.error("Autoplay fail on first track", e));
          }
        }, 200);
      }
    } catch (error) {
      console.error("Error fetching track info:", error);
    } finally {
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    const newPlaylist = playlist.filter((track) => track.id !== trackId);
    setPlaylist(newPlaylist);

    if (currentTrack?.id === trackId) {
      if (newPlaylist.length > 0) {
        const newIndex = Math.min(currentIndex, newPlaylist.length - 1);
        setCurrentTrack(newPlaylist[newIndex]);
        setCurrentIndex(newIndex);
      } else {
        if (hasUserTracks) {
          setHasUserTracks(false);
          setPlaylist(initialPlaylist.playlist);
          setCurrentTrack(initialPlaylist.playlist[0]);
          setCurrentIndex(0);
        } else {
          setCurrentTrack(null);
          setCurrentIndex(0);
          setIsPlaying(false);
        }
      }
    }
  };

  const handleClearPlaylist = () => {
    setPlaylist(initialPlaylist.playlist);
    setCurrentTrack(initialPlaylist.playlist[0]);
    setCurrentIndex(0);
    setHasUserTracks(false);
    setIsPlaying(false);
  };

  const handleNextTrack = () => {
    if (isInRoom) {
      if (!isOwner || !emitters || playlistToUse.length === 0) return;
      const nextIndex = (currentIndexToUse + 1) % playlistToUse.length;
      emitters.requestStateChange({
        currentTrackIndex: nextIndex,
        isPlaying: true,
        timestamp: 0,
      });
    } else {
      if (localPlaylist.length === 0) return;
      setLocalCurrentIndex((prev) => (prev + 1) % localPlaylist.length);
      setLocalIsPlaying(true);
    }
  };

  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;

    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }

    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
  };

  const handleTrackEnd = () => {
    if (isRepeating) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  const handlePlaylistSelect = (newPlaylist: Song[]) => {
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
      setCurrentTrack(newPlaylist[0]);
      setCurrentIndex(0);
      setHasUserTracks(true);

      console.log("newPlaylist ==> ", newPlaylist);

      setTimeout(() => {
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current
            .play()
            .catch((e) => console.error("Autoplay failed", e));
        }
      }, 500);
    }
  };

  return (
    <>
      {/* Audio Element */}
      {currentTrack && (
        <audio
          autoPlay
          ref={audioRef}
          src={`${process.env.NEXT_PUBLIC_DEV_API_URL}${endpoint.stream_music}?url=${currentTrack?.url}`}
          onEnded={handleTrackEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume[0] / 100;
            }
          }}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 p-1 z-50">
        <div
          className="absolute inset-0 -z-10
                  bg-gradient-to-r from-amber-50 to-orange-50
                  dark:from-amber-950 dark:to-orange-950
                  opacity-100 backdrop-blur-sm
                  border-t border-amber-200/50 dark:border-amber-800/50"
        ></div>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <div
            className="min-w-0 max-w-[220px] cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/50 rounded-lg p-2 transition-colors"
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            {currentTrack ? (
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-sm text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-full">
                  {playlist.length}
                </span>
                <div className="truncate flex-1">
                  <p className="text-lg font-medium truncate text-amber-900 dark:text-amber-100">
                    {currentTrack.title}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                <ChevronUp
                  className={`h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform ${
                    showPlaylist ? "rotate-180" : ""
                  }`}
                />
              </div>
            ) : (
              <p className="text-lg text-amber-600 dark:text-amber-400">
                No track selected
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              className={`h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 ${
                isShuffled
                  ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              <Shuffle className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousTrack}
              className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300"
            >
              <SkipBack className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              onClick={handlePlayPause}
              disabled={!currentTrack}
              className="h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextTrack}
              className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300"
            >
              <SkipForward className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRepeating(!isRepeating)}
              className={`h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 ${
                isRepeating
                  ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              <Repeat className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 min-w-[120px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300"
            >
              {isMuted || volume[0] === 0 ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
            <Slider
              value={volume}
              max={100}
              step={1}
              className="flex-1"
              onValueChange={handleVolumeChange}
            />
          </div>

          {/* add song modal */}
          <div className="flex items-center gap-2">
            <AddSongModal onAddSong={handleAddTrack} />
          </div>

          <PlaylistModal onPlaylistSelect={handlePlaylistSelect} />
        </div>
      </div>

      {showPlaylist && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto max-h-80 bg-gradient-to-br from-amber-50/98 to-orange-50/98 dark:from-amber-950/98 dark:to-orange-950/98 backdrop-blur-md border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-4 z-40 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-amber-900 dark:text-amber-100">
              Playlist ({playlist.length})
            </h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearPlaylist}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                title="Clear All"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylist(false)}
                className="h-6 w-6 p-0 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-lg text-sm cursor-pointer transition-all hover:bg-amber-100/70 dark:hover:bg-amber-900/70 ${
                  currentTrack?.id === track.id
                    ? "bg-amber-200/70 dark:bg-amber-800/70 ring-1 ring-amber-400/50"
                    : "bg-white/30 dark:bg-black/20"
                }`}
                onClick={() => {
                  setCurrentTrack(track);
                  setCurrentIndex(index);
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {currentTrack?.id === track.id && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium truncate text-amber-900 dark:text-amber-100">
                      {track.title}
                    </p>
                    <p className="text-[16px] text-amber-700 dark:text-amber-300 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTrack(track.id);
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 ml-2 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {playlist.length === 0 && (
              <div className="text-center py-8 text-amber-600 dark:text-amber-400">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-lg">No tracks in playlist</p>
                <p className="text-sm opacity-75">
                  Add some music to get started
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
