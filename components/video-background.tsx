"use client";

import { getRandomBackground } from "@/data/video-background";

interface VideoBackgroundProps {
  currentTrack?: { url: string; title: string } | null;
}

export function VideoBackground({ currentTrack }: VideoBackgroundProps) {

  const background = getRandomBackground("Work");

  return (
    <div className="fixed inset-0 z-0">
      <video
        src={background?.url}
        muted
        autoPlay
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
    </div>
  );
}
