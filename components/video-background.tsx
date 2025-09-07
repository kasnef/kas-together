"use client"

import { useEffect, useState } from "react"

interface VideoBackgroundProps {
  currentTrack?: { url: string; title: string } | null
}

export function VideoBackground({ currentTrack }: VideoBackgroundProps) {
  const [currentGif, setCurrentGif] = useState(0)

  const lofiGifs = [
    "/placeholder.gif?query=lofi girl studying with cat by window rain",
    "/placeholder.gif?query=cozy coffee shop with steam rising from cup",
    "/placeholder.gif?query=pixel art city night scene with neon lights",
    "/placeholder.gif?query=animated fireplace with books and plants",
    "/placeholder.gif?query=lofi bedroom setup with vinyl records playing",
    "/placeholder.gif?query=rainy window view with warm indoor lighting",
    "/placeholder.gif?query=pixel art train journey through countryside",
    "/placeholder.gif?query=cozy library with floating books animation",
  ]

  useEffect(() => {
    const isYouTube = currentTrack?.url?.includes("youtube.com") || currentTrack?.url?.includes("youtu.be")

    if (!isYouTube) {
      const interval = setInterval(() => {
        setCurrentGif((prev) => (prev + 1) % lofiGifs.length)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [currentTrack, lofiGifs.length])

  const isYouTube = currentTrack?.url?.includes("youtube.com") || currentTrack?.url?.includes("youtu.be")

  if (isYouTube && currentTrack) {
    // Extract YouTube video ID from URL
    const getYouTubeId = (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      return match ? match[1] : null
    }

    const videoId = getYouTubeId(currentTrack.url)

    if (videoId) {
      return (
        <div className="fixed inset-0 z-0">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 z-0">
      <img
        src={lofiGifs[currentGif] || "/placeholder.svg"}
        alt="Lofi ambient background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
    </div>
  )
}
