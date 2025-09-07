"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Plus,
  Trash2,
  X,
  ChevronUp,
  Music,
} from "lucide-react"

interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration: number
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: "default-1",
    title: "Lofi Study Session",
    artist: "Cafe Sounds",
    url: "/placeholder.mp3?query=lofi hip hop study music",
    duration: 180,
  },
  {
    id: "default-2",
    title: "Rainy Day Vibes",
    artist: "Chill Beats",
    url: "/placeholder.mp3?query=lofi rain ambient music",
    duration: 200,
  },
  {
    id: "default-3",
    title: "Coffee Shop Jazz",
    artist: "Smooth Lofi",
    url: "/placeholder.mp3?query=coffee shop jazz lofi",
    duration: 165,
  },
]

interface MusicPlayerProps {
  onTrackChange?: (track: Track | null) => void
}

export function MusicPlayer({ onTrackChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_TRACKS)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [hasUserTracks, setHasUserTracks] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (DEFAULT_TRACKS.length > 0 && !hasUserTracks) {
      setCurrentTrack(DEFAULT_TRACKS[0])
      setCurrentIndex(0)
      // Auto-play after a short delay
      setTimeout(() => {
        setIsPlaying(true)
      }, 1000)
    }
  }, [hasUserTracks])

  useEffect(() => {
    onTrackChange?.(currentTrack)
  }, [currentTrack, onTrackChange])

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrack])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100
    }
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const handleAddTrack = () => {
    if (urlInput.trim()) {
      if (!hasUserTracks) {
        setPlaylist([])
        setHasUserTracks(true)
      }

      const newTrack: Track = {
        id: Date.now().toString(),
        title: `Track ${playlist.length + 1}`,
        artist: "Unknown Artist",
        url: urlInput,
        duration: 0,
      }

      const newPlaylist = hasUserTracks ? [...playlist, newTrack] : [newTrack]
      setPlaylist(newPlaylist)

      if (!currentTrack || !hasUserTracks) {
        setCurrentTrack(newTrack)
        setCurrentIndex(hasUserTracks ? playlist.length : 0)
      }

      setUrlInput("")
    }
  }

  const handleDeleteTrack = (trackId: string) => {
    const newPlaylist = playlist.filter((track) => track.id !== trackId)
    setPlaylist(newPlaylist)

    if (currentTrack?.id === trackId) {
      if (newPlaylist.length > 0) {
        const newIndex = Math.min(currentIndex, newPlaylist.length - 1)
        setCurrentTrack(newPlaylist[newIndex])
        setCurrentIndex(newIndex)
      } else {
        if (hasUserTracks) {
          setHasUserTracks(false)
          setPlaylist(DEFAULT_TRACKS)
          setCurrentTrack(DEFAULT_TRACKS[0])
          setCurrentIndex(0)
        } else {
          setCurrentTrack(null)
          setCurrentIndex(0)
          setIsPlaying(false)
        }
      }
    }
  }

  const handleClearPlaylist = () => {
    setPlaylist(DEFAULT_TRACKS)
    setCurrentTrack(DEFAULT_TRACKS[0])
    setCurrentIndex(0)
    setHasUserTracks(false)
    setIsPlaying(false)
  }

  const handleNextTrack = () => {
    if (playlist.length === 0) return

    let nextIndex
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length)
    } else {
      nextIndex = (currentIndex + 1) % playlist.length
    }

    setCurrentIndex(nextIndex)
    setCurrentTrack(playlist[nextIndex])
  }

  const handlePreviousTrack = () => {
    if (playlist.length === 0) return

    let prevIndex
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length)
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    }

    setCurrentIndex(prevIndex)
    setCurrentTrack(playlist[prevIndex])
  }

  const handleTrackEnd = () => {
    if (isRepeating) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      handleNextTrack()
    }
  }

  return (
    <>
      {/* Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={handleTrackEnd}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume[0] / 100
              audioRef.current.muted = isMuted
            }
          }}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-50/95 to-orange-50/95 dark:from-amber-950/95 dark:to-orange-950/95 backdrop-blur-sm border-t border-amber-200/50 dark:border-amber-800/50 p-3 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div
            className="flex-1 min-w-0 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/50 rounded-lg p-2 transition-colors"
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            {currentTrack ? (
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div className="truncate flex-1">
                  <p className="text-sm font-medium truncate text-amber-900 dark:text-amber-100">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 truncate">{currentTrack.artist}</p>
                </div>
                <ChevronUp
                  className={`h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform ${showPlaylist ? "rotate-180" : ""}`}
                />
              </div>
            ) : (
              <p className="text-sm text-amber-600 dark:text-amber-400">No track selected</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              className={`h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 ${isShuffled ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900" : "text-amber-700 dark:text-amber-300"}`}
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
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
              className={`h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900 ${isRepeating ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900" : "text-amber-700 dark:text-amber-300"}`}
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
              {isMuted || volume[0] === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
            <Slider value={volume} max={100} step={1} className="flex-1" onValueChange={handleVolumeChange} />
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Add URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-32 h-8 text-xs border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600"
            />
            <Button
              onClick={handleAddTrack}
              size="sm"
              className="h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearPlaylist}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              title="Clear All"
            >
              <X className="h-3 w-3" />
            </Button>
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-full">
              {playlist.length}
            </span>
          </div>
        </div>
      </div>

      {showPlaylist && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto max-h-80 bg-gradient-to-br from-amber-50/98 to-orange-50/98 dark:from-amber-950/98 dark:to-orange-950/98 backdrop-blur-md border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-4 z-40 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">Playlist ({playlist.length})</h4>
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
                className={`flex items-center justify-between p-3 rounded-lg text-xs cursor-pointer transition-all hover:bg-amber-100/70 dark:hover:bg-amber-900/70 ${
                  currentTrack?.id === track.id
                    ? "bg-amber-200/70 dark:bg-amber-800/70 ring-1 ring-amber-400/50"
                    : "bg-white/30 dark:bg-black/20"
                }`}
                onClick={() => {
                  setCurrentTrack(track)
                  setCurrentIndex(index)
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {currentTrack?.id === track.id && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-amber-900 dark:text-amber-100">{track.title}</p>
                    <p className="text-amber-700 dark:text-amber-300 truncate">{track.artist}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTrack(track.id)
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
                <p className="text-sm">No tracks in playlist</p>
                <p className="text-xs opacity-75">Add some music to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
