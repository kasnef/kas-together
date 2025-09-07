"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Cloud, Coffee, Keyboard, Zap, Leaf, Waves, Volume2, VolumeX } from "lucide-react"

interface AmbientSound {
  id: string
  name: string
  icon: React.ReactNode
  url: string
  isPlaying: boolean
  volume: number
}

export function AmbientSoundsSidebar() {
  const [sounds, setSounds] = useState<AmbientSound[]>([
    {
      id: "rain",
      name: "Rain",
      icon: <Cloud className="h-4 w-4" />,
      url: "/placeholder.mp3?query=gentle rain sounds for relaxation",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "cafe",
      name: "Cafe",
      icon: <Coffee className="h-4 w-4" />,
      url: "/placeholder.mp3?query=coffee shop ambient sounds with chatter",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "keyboard",
      name: "Typing",
      icon: <Keyboard className="h-4 w-4" />,
      url: "/placeholder.mp3?query=mechanical keyboard typing sounds",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "thunder",
      name: "Thunder",
      icon: <Zap className="h-4 w-4" />,
      url: "/placeholder.mp3?query=distant thunder and storm sounds",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "nature",
      name: "Forest",
      icon: <Leaf className="h-4 w-4" />,
      url: "/placeholder.mp3?query=forest birds and nature sounds",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "water",
      name: "Stream",
      icon: <Waves className="h-4 w-4" />,
      url: "/placeholder.mp3?query=flowing water and stream sounds",
      isPlaying: false,
      volume: 50,
    },
  ])

  const [selectedSound, setSelectedSound] = useState<AmbientSound | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const toggleSound = (soundId: string) => {
    setSounds((prevSounds) =>
      prevSounds.map((sound) => {
        if (sound.id === soundId) {
          const audio = audioRefs.current[soundId]
          if (audio) {
            if (sound.isPlaying) {
              audio.pause()
            } else {
              audio.play()
            }
          }
          return { ...sound, isPlaying: !sound.isPlaying }
        }
        return sound
      }),
    )
  }

  const updateVolume = (soundId: string, volume: number[]) => {
    setSounds((prevSounds) =>
      prevSounds.map((sound) => {
        if (sound.id === soundId) {
          const audio = audioRefs.current[soundId]
          if (audio) {
            audio.volume = volume[0] / 100
          }
          return { ...sound, volume: volume[0] }
        }
        return sound
      }),
    )
  }

  return (
    <>
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-2 space-y-2">
        {sounds.map((sound) => (
          <Dialog key={sound.id}>
            <DialogTrigger asChild>
              <Button
                variant={sound.isPlaying ? "default" : "ghost"}
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => setSelectedSound(sound)}
              >
                {sound.icon}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {sound.icon}
                  {sound.name} Sounds
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Button
                    variant={sound.isPlaying ? "default" : "outline"}
                    onClick={() => toggleSound(sound.id)}
                    className="gap-2"
                  >
                    {sound.icon}
                    {sound.isPlaying ? "Stop" : "Play"} {sound.name}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volume</span>
                    <span className="text-sm text-muted-foreground">{sound.volume}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateVolume(sound.id, sound.volume > 0 ? [0] : [50])}
                      className="h-8 w-8 p-0"
                    >
                      {sound.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[sound.volume]}
                      max={100}
                      step={1}
                      className="flex-1"
                      onValueChange={(value) => updateVolume(sound.id, value)}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Audio Elements */}
      {sounds.map((sound) => (
        <audio
          key={sound.id}
          ref={(el) => {
            if (el) audioRefs.current[sound.id] = el
          }}
          src={sound.url}
          loop
          onEnded={() => {
            setSounds((prev) => prev.map((s) => (s.id === sound.id ? { ...s, isPlaying: false } : s)))
          }}
        />
      ))}
    </>
  )
}
