"use client";

import {
  RelaxPlaylist,
  SadnessPlaylist,
  ShortLovePlaylist,
  ShortRelaxPlaylist,
  SleepPlaylist,
  WorkingPlaylist,
} from "@/data/music-playlist";
import {
  getRandomBackground,
  getRandomPlaylistBackground,
} from "@/data/video-background";

import { useGenericStore } from "@/store/useStore";
import { useMemo } from "react";

interface VideoBackgroundProps {
  currentTrack?: { url: string; title: string } | null;
}

export function VideoBackground({ currentTrack }: VideoBackgroundProps) {
  const item = useGenericStore((state) => state.simpleItem);

  const background = getRandomBackground(item.name);
  const playlistVideo = getRandomPlaylistBackground();

  const isTrackInSystemPlaylists = useMemo(() => {
    if (!currentTrack?.url) {
      return false;
    }

    const allSystemPlaylists = [
      ...ShortLovePlaylist,
      ...ShortRelaxPlaylist,
      ...RelaxPlaylist,
      ...SadnessPlaylist,
      ...WorkingPlaylist,
      ...SleepPlaylist,
    ];

    return allSystemPlaylists.some((song) => song.url === currentTrack.url);
  }, [currentTrack?.url]);

  const shouldShowPlaylistVideo =
    currentTrack?.url &&
    currentTrack.url.includes("youtube") &&
    !isTrackInSystemPlaylists;

  const videoSrc = shouldShowPlaylistVideo ? playlistVideo : background?.url;

  return (
    <div className="fixed inset-0 z-0">
      <video
        key={videoSrc}
        src={videoSrc}
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
