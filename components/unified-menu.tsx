"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Menu, X, Music, Volume2 } from "lucide-react"
import { PomodoroTimer } from "./pomodoro-timer"
import { DialogTitle } from "@radix-ui/react-dialog"

interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration: number
}

interface UnifiedMenuProps {
  currentTrack: Track | null
}

export function UnifiedMenu({ currentTrack }: UnifiedMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const handleNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  return (
    <>
      {notification && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-primary to-orange-500 text-white p-3 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="fixed top-4 right-4 z-50 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 border-orange-200 dark:border-orange-800 hover:from-orange-200 hover:to-amber-200 dark:hover:from-orange-800 dark:hover:to-amber-800 text-orange-700 dark:text-orange-300 shadow-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[80vh] bg-gradient-to-br from-orange-50/95 to-amber-50/95 dark:from-orange-950/95 dark:to-amber-950/95 backdrop-blur-md border-orange-200/50 dark:border-orange-800/50 p-0 shadow-2xl overflow-hidden">
          <div className="flex flex-col h-full max-h-[80vh]">
            <div  className="flex items-center justify-between p-6 border-b border-orange-200/50 dark:border-orange-800/50">
              <DialogTitle className="text-lg font-medium text-orange-900 dark:text-orange-100">Control Panel</DialogTitle>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <PomodoroTimer onNotification={handleNotification} />

              <Card className="bg-gradient-to-br from-white/50 to-orange-50/50 dark:from-black/20 dark:to-orange-950/50 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Music className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100">Now Playing</h3>
                </div>
                {currentTrack ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-200 truncate">
                      {currentTrack.title}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 truncate">{currentTrack.artist}</p>
                    <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                      {currentTrack.url.includes("youtube") ? "📺 YouTube" : "🎵 Audio"}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-orange-600 dark:text-orange-400">No track playing</p>
                )}
              </Card>

              <Card className="bg-gradient-to-br from-white/50 to-orange-50/50 dark:from-black/20 dark:to-orange-950/50 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100">Ambient Sounds</h3>
                </div>
                <div className="space-y-3">
                  <AmbientSoundControl icon="🌧️" label="Rain" soundType="rain" />
                  <AmbientSoundControl icon="☕" label="Coffee Shop" soundType="coffee" />
                  <AmbientSoundControl icon="⌨️" label="Keyboard" soundType="keyboard" />
                  <AmbientSoundControl icon="⛈️" label="Thunder" soundType="thunder" />
                  <AmbientSoundControl icon="🌿" label="Nature" soundType="nature" />
                  <AmbientSoundControl icon="🌊" label="Water" soundType="water" />
                </div>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface AmbientSoundControlProps {
  icon: string
  label: string
  soundType: string
}

function AmbientSoundControl({ icon, label, soundType }: AmbientSoundControlProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)

  const toggleSound = () => {
    setIsPlaying(!isPlaying)
    console.log(`[v0] ${isPlaying ? "Stopping" : "Playing"} ${soundType} sound`)
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-100/30 dark:bg-orange-900/30 border border-orange-200/30 dark:border-orange-800/30">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium text-orange-900 dark:text-orange-100">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-16 h-2 bg-orange-200/50 dark:bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
          disabled={!isPlaying}
        />
        <Button
          variant={isPlaying ? "default" : "ghost"}
          size="sm"
          onClick={toggleSound}
          className={`h-6 w-12 text-xs font-medium ${
            isPlaying
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900"
          }`}
        >
          {isPlaying ? "ON" : "OFF"}
        </Button>
      </div>
    </div>
  )
}
