"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Cloud, Coffee, Keyboard, Zap, Leaf, Waves, Volume2, VolumeX } from "lucide-react"

interface AmbientSound {
  id: string
  name: string
  icon: React.ReactNode
  url: string
  isPlaying: boolean
  volume: number
}

export function AmbientSounds() {
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
    <div className="space-y-3">
      {sounds.map((sound) => (
        <Card key={sound.id} className="p-3 bg-card/30">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant={sound.isPlaying ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleSound(sound.id)}
              className="gap-2 flex-1 justify-start"
            >
              {sound.icon}
              {sound.name}
            </Button>
            <div className="text-xs text-muted-foreground">{sound.volume}%</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => updateVolume(sound.id, sound.volume > 0 ? [0] : [50])}
            >
              {sound.volume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
            <Slider
              value={[sound.volume]}
              max={100}
              step={1}
              className="flex-1"
              onValueChange={(value) => updateVolume(sound.id, value)}
            />
          </div>

          {/* Audio Element */}
          <audio
            ref={(el) => {
              if (el) audioRefs.current[sound.id] = el
            }}
            src={sound.url}
            loop
            onEnded={() => {
              setSounds((prev) => prev.map((s) => (s.id === sound.id ? { ...s, isPlaying: false } : s)))
            }}
          />
        </Card>
      ))}
    </div>
  )
}
