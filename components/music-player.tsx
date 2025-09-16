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
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useGenericStore } from "@/store/useStore";
import { AddSongModal } from "./add-song-modal";
import { PlaylistModal } from "./playlist-modal";
import endpoint from "@/services/endpoint";
import { getYtInfo } from "@/services/api/getYtInfo.api";
import { useRoomMusicStore } from "@/store/useMusicStore";

interface MusicPlayerProps {
  onTrackChange?: (track: Song | null) => void;
  autoStartForFirstTime?: boolean;
}

export const MusicPlayer = forwardRef<any, MusicPlayerProps>(
  ({ onTrackChange, autoStartForFirstTime }, ref) => {
    const [initialPlaylist] = useState(() => getRandomPlaylist());
    const setSimpleItem = useGenericStore((state) => state.setSimpleItem);

    const [volume, setVolume] = useState([75]);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
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

    const [localPlaylist, setLocalPlaylist] = useState<Song[]>(
      () => getRandomPlaylist().playlist
    );
    const [localIsPlaying, setLocalIsPlaying] = useState(false);
    const [localCurrentIndex, setLocalCurrentIndex] = useState<number>(() => {
      const len = initialPlaylist?.playlist?.length || 0;
      if (len > 0) {
        const randomIndex = Math.floor(Math.random() * len);
        console.log(`Random song index: ${randomIndex}/${len - 1}`); // Debug log
        return randomIndex;
      }
      return 0;
    });

    const playlist = isInRoom ? syncedPlaylist : localPlaylist;
    const isPlaying = isInRoom ? syncedIsPlaying : localIsPlaying;
    const currentIndex = isInRoom ? syncedCurrentIndex : localCurrentIndex;
    const currentTrack = playlist[currentIndex] || null;

    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
      startPlayback: () => {
        if (!hasUserTracks && initialPlaylist.playlist.length > 0) {
          setLocalPlaylist(initialPlaylist.playlist);
          setLocalCurrentIndex(0);
          setHasUserTracks(true);

          setLocalIsPlaying(true);

          // Wait for state to update and audio to be ready
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.play().catch((e) => {
                console.error("First-time autoplay failed:", e);
              });
            }
          }, 100);
        } else if (hasUserTracks && !localIsPlaying) {
          setLocalIsPlaying(true);
        }
      },
    }));

    useEffect(() => {
      if (
        autoStartForFirstTime &&
        !hasUserTracks &&
        initialPlaylist.playlist.length > 0
      ) {
        // Prepare the playlist but don't start playing until user clicks
        setLocalPlaylist(initialPlaylist.playlist);
        setLocalCurrentIndex(0);
      }
    }, [autoStartForFirstTime, hasUserTracks, initialPlaylist.playlist]);

    useEffect(() => {
      if (isInRoom && !isOwner && audioRef.current) {
        const audio = audioRef.current;

        // Sync playlist if different
        if (JSON.stringify(localPlaylist) !== JSON.stringify(syncedPlaylist)) {
          setLocalPlaylist(syncedPlaylist);
        }

        const timeDiff = Math.abs(audio.currentTime - syncedTimestamp);
        if (timeDiff > 1.0) {
          audio.currentTime = syncedTimestamp;
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

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (!process.env.NEXT_PUBLIC_DEV_API_URL) {
        console.warn(
          "Music streaming disabled: NEXT_PUBLIC_DEV_API_URL not configured"
        );
        return;
      }

      // Set audio source if track changed
      if (
        currentTrack &&
        (!audio.src || !audio.src.includes(currentTrack.url))
      ) {
        const newSrc = `${process.env.NEXT_PUBLIC_DEV_API_URL}${endpoint.stream_music}?url=${currentTrack?.url}`;

        audio.src = newSrc;
        audio.preload = "metadata";
        audio.crossOrigin = "anonymous";
        audio.load();
      }

      // Clear audio if no track
      if (!currentTrack && audio.src) {
        audio.src = "";
      }

      if (!process.env.NEXT_PUBLIC_DEV_API_URL) {
        return;
      }

      // Handle play/pause state
      if (isPlaying && audio.paused) {
        audio.play().catch((e) => {
          console.error("Audio play failed:", e);
          console.error("Error details:", {
            name: e.name,
            message: e.message,
            mode: isInRoom ? "ROOM" : "SOLO",
            trackTitle: currentTrack?.title,
            audioSrc: audio.src,
          });
          // Simple skip to next track on any error
          setTimeout(() => {
            handleNextTrack();
          }, 1000);
        });
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }

      if (isInRoom && !isOwner && currentTrack) {
        const timeDiff = Math.abs(audio.currentTime - syncedTimestamp);
        if (timeDiff > 1.0) {
          audio.currentTime = syncedTimestamp;
        }
      }
    }, [currentTrack, isPlaying, isInRoom, isOwner, syncedTimestamp]);

    useEffect(() => {
      if (!isInRoom) {
        localStorage.setItem(
          "localMusicState",
          JSON.stringify({
            playlist: localPlaylist,
            currentIndex: localCurrentIndex,
            isPlaying: localIsPlaying,
          })
        );
      }
    }, [localPlaylist, localCurrentIndex, localIsPlaying, isInRoom]);

    useEffect(() => {
      if (initialPlaylist.playlist.length > 0 && !hasUserTracks) {
        if (!isInRoom) {
          if (
            localCurrentIndex === undefined ||
            localCurrentIndex >= initialPlaylist.playlist.length
          ) {
            const randomIndex = Math.floor(
              Math.random() * initialPlaylist.playlist.length
            );
            setLocalCurrentIndex(randomIndex);
          }
          setSimpleItem({ name: initialPlaylist.videoPlaylistKey });
        }
      }
    }, [initialPlaylist.playlist, isInRoom]);

    useEffect(() => {
      onTrackChange?.(currentTrack);
    }, [currentTrack, onTrackChange]);

    const handlePlayPause = () => {
      if (isInRoom) {
        if (!isOwner || !emitters || !audioRef.current) {
          return;
        }
        emitters.requestStateChange({
          isPlaying: !syncedIsPlaying,
          timestamp: audioRef.current.currentTime,
        });
      } else {
        setLocalIsPlaying(!localIsPlaying);
      }
    };

    const handleMute = () => {
      setIsMuted(!isMuted);
      if (audioRef.current) {
        audioRef.current.muted = !isMuted;
      }
    };

    const handleVolumeChange = (newVolume: number[]) => {
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume[0] / 100;
      }
    };

    const handleNextTrack = () => {
      if (isInRoom) {
        if (!isOwner || !emitters || playlist.length === 0) {
          return;
        }

        let nextIndex = (syncedCurrentIndex + 1) % playlist.length;
        if (isShuffled && playlist.length > 1) {
          do {
            nextIndex = Math.floor(Math.random() * playlist.length);
          } while (nextIndex === syncedCurrentIndex);
        }

        emitters.requestStateChange({
          currentTrackIndex: nextIndex,
          isPlaying: true,
          timestamp: 0,
        });
      } else {
        if (playlist.length === 0) return;

        let nextIndex = (localCurrentIndex + 1) % playlist.length;
        if (isShuffled && playlist.length > 1) {
          do {
            nextIndex = Math.floor(Math.random() * playlist.length);
          } while (nextIndex === localCurrentIndex);
        }

        setLocalCurrentIndex(nextIndex);
        setLocalIsPlaying(true);
      }
    };

    const handlePreviousTrack = () => {
      if (playlist.length === 0) return;

      if (isInRoom) {
        if (!isOwner || !emitters) return;

        let prevIndex =
          syncedCurrentIndex === 0
            ? playlist.length - 1
            : syncedCurrentIndex - 1;
        if (isShuffled && playlist.length > 1) {
          do {
            prevIndex = Math.floor(Math.random() * playlist.length);
          } while (prevIndex === syncedCurrentIndex);
        }

        emitters.requestStateChange({
          currentTrackIndex: prevIndex,
          isPlaying: true,
          timestamp: 0,
        });
      } else {
        let prevIndex =
          localCurrentIndex === 0 ? playlist.length - 1 : localCurrentIndex - 1;
        if (isShuffled && playlist.length > 1) {
          prevIndex = Math.floor(Math.random() * playlist.length);
        }

        setLocalCurrentIndex(prevIndex);
      }
    };

    const handleTrackEnd = () => {
      if (isRepeating) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .catch((e) => console.error("Repeat play failed:", e));
        }
      } else {
        handleNextTrack();
      }
    };

    const handleAddTrack = async (url: string) => {
      const cleanUrl = url.replace(/&.*$/, "");
      if (!cleanUrl.trim()) return;

      try {
        const info: Song = await getYtInfo(url);
        const newTrack: Song = {
          id: info?.id,
          title: info.title,
          name: info.title,
          artist: info.artist,
          url: url,
        };

        if (isInRoom) {
          if (!emitters) return;

          emitters.requestAddTrack(newTrack, !hasUserTracks);
          setHasUserTracks(true);
        } else {
          if (hasUserTracks) {
            setLocalPlaylist((prev) => [...prev, newTrack]);
          } else {
            setLocalPlaylist([newTrack]);
            setHasUserTracks(true);
            setLocalCurrentIndex(0);
            setLocalIsPlaying(true);

            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current
                  .play()
                  .catch((e) => console.error("Autoplay failed:", e));
              }
            }, 200);
          }
        }
      } catch (error) {
        console.error("Error fetching track info:", error);
      }
    };

    const handleDeleteTrack = (trackId: string) => {
      if (isInRoom && !isOwner) return; // Only owner can delete in room

      const newPlaylist = playlist.filter((track) => track.id !== trackId);

      if (isInRoom && emitters) {
        return;
      } else {
        setLocalPlaylist(newPlaylist);

        if (currentTrack?.id === trackId) {
          if (newPlaylist.length > 0) {
            const newIndex = Math.min(
              localCurrentIndex,
              newPlaylist.length - 1
            );
            setLocalCurrentIndex(newIndex);
          } else {
            if (hasUserTracks) {
              setHasUserTracks(false);
              setLocalPlaylist(initialPlaylist.playlist);
              setLocalCurrentIndex(0);
            } else {
              setLocalCurrentIndex(0);
              setLocalIsPlaying(false);
            }
          }
        }
      }
    };

    const handleClearPlaylist = () => {
      if (isInRoom && !isOwner) return;

      if (isInRoom && emitters) {
        return;
      } else {
        setLocalPlaylist(initialPlaylist.playlist);
        setLocalCurrentIndex(0);
        setHasUserTracks(false);
        setLocalIsPlaying(false);
      }
    };

    const handlePlaylistSelect = (newPlaylist: Song[]) => {
      if (newPlaylist && newPlaylist.length > 0) {
        if (isInRoom && emitters) {
          emitters.requestStateChange({
            playlist: newPlaylist,
            currentTrackIndex: 0,
            isPlaying: false,
            timestamp: 0,
          });
          setHasUserTracks(true);
        } else {
          const len = initialPlaylist?.playlist?.length || 0;
          const random_song = len > 0 ? Math.floor(Math.random() * len) : 0;
          setLocalPlaylist(newPlaylist);
          setLocalCurrentIndex(random_song);
          setHasUserTracks(true);

          setTimeout(() => {
            setLocalIsPlaying(true);
            if (audioRef.current) {
              audioRef.current
                .play()
                .catch((e) => console.error("Autoplay failed:", e));
            }
          }, 500);
        }
      }
    };

    return (
      <>
        {currentTrack && process.env.NEXT_PUBLIC_DEV_API_URL && (
          <audio
            ref={audioRef}
            src={`${process.env.NEXT_PUBLIC_DEV_API_URL}${endpoint.stream_music}?url=${currentTrack?.url}`}
            preload="metadata"
            crossOrigin="anonymous"
            onEnded={handleTrackEnd}
            onPlay={() => {
              if (!isInRoom) setLocalIsPlaying(true);
            }}
            onPause={() => {
              if (!isInRoom) setLocalIsPlaying(false);
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                audioRef.current.volume = volume[0] / 100;
              }
            }}
            onError={(e) => {
              const target = e.target as HTMLAudioElement;
              const error = target.error;
              if (error) {
                console.error("Audio error:", {
                  code: error.code,
                  message: error.message,
                  track: currentTrack?.title,
                  mode: isInRoom ? "ROOM" : "SOLO",
                  audioSrc: target.src,
                  networkState: target.networkState,
                  readyState: target.readyState,
                });
                setTimeout(() => {
                  handleNextTrack();
                }, 1000);
              }
            }}
          />
        )}

        {!process.env.NEXT_PUBLIC_DEV_API_URL && (
          <div className="fixed top-4 right-4 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-lg p-4 max-w-sm z-50">
            <div className="flex items-start gap-2">
              <Music className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Music Streaming Disabled
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  Configure NEXT_PUBLIC_DEV_API_URL in Project Settings to
                  enable audio playback.
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Click the gear icon (⚙️) → Environment Variables
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="fixed bottom-0 left-0 right-0 p-1 z-50"
          data-music-player="true"
        >
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
                {isInRoom && (
                  <span className="text-sm text-amber-600 dark:text-amber-400 ml-2">
                    {isOwner ? "(Owner)" : "(Member)"}
                  </span>
                )}
              </h4>
              <div className="flex gap-2">
                {(!isInRoom || isOwner) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearPlaylist}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    title="Clear All"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
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
                    if (isInRoom) {
                      if (isOwner && emitters) {
                        emitters.requestStateChange({
                          currentTrackIndex: index,
                          isPlaying: true,
                          timestamp: 0,
                        });
                      }
                    } else {
                      setLocalCurrentIndex(index);
                      setLocalIsPlaying(true);
                    }
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
                  {(!isInRoom || isOwner) && (
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
                  )}
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
);

MusicPlayer.displayName = "MusicPlayer";
