"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface MemeModalProps {
  isOpen: boolean
  onClose: () => void
  fromUser: string
  toUser: string
}

const MEMES = [
  {
    text: "🎵 VIBING INTENSIFIES 🎵",
    emoji: "🎵",
    animation: "animate-bounce",
  },
  {
    text: "☕ COFFEE BREAK TIME! ☕",
    emoji: "☕",
    animation: "animate-pulse",
  },
  {
    text: "🌙 LOFI MOOD ACTIVATED 🌙",
    emoji: "🌙",
    animation: "animate-spin",
  },
  {
    text: "💻 CODING BEAST MODE 💻",
    emoji: "💻",
    animation: "animate-ping",
  },
  {
    text: "🔥 THIS BEAT IS FIRE 🔥",
    emoji: "🔥",
    animation: "animate-bounce",
  },
  {
    text: "✨ PRODUCTIVITY MAGIC ✨",
    emoji: "✨",
    animation: "animate-pulse",
  },
  {
    text: "🎧 HEADPHONES ON, WORLD OFF 🎧",
    emoji: "🎧",
    animation: "animate-spin",
  },
  {
    text: "🌊 RIDING THE WAVE 🌊",
    emoji: "🌊",
    animation: "animate-bounce",
  },
]

export function MemeModal({ isOpen, onClose, fromUser, toUser }: MemeModalProps) {
  const [currentMeme, setCurrentMeme] = useState(MEMES[0])
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const randomMeme = MEMES[Math.floor(Math.random() * MEMES.length)]
      setCurrentMeme(randomMeme)
      setShowAnimation(true)

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShowAnimation(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showAnimation])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative p-8 max-w-md w-full mx-4 glass-effect lofi-glow border-primary/50">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 h-6 w-6">
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{fromUser}</span> sent you a meme!
          </div>

          <div className={`text-6xl ${showAnimation ? currentMeme.animation : ""}`}>{currentMeme.emoji}</div>

          <div className="text-lg font-bold text-primary pixel-border p-4 bg-primary/10">{currentMeme.text}</div>

          <div className="text-xs text-muted-foreground">This message will disappear in a few seconds...</div>
        </div>
      </Card>
    </div>
  )
}
