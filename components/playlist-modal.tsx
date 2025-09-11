"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RelaxPlaylist,
  SadnessPlaylist,
  ShortLovePlaylist,
  ShortRelaxPlaylist,
  SleepPlaylist,
  WorkingPlaylist,
  type Song,
} from "@/data/music-playlist";
import { useGenericStore } from "@/store/useStore";
import {
  Brain,
  Coffee,
  Droplet,
  Heart,
  ListPlus,
  Moon,
  Music,
} from "lucide-react";
import { useState } from "react";

const PLAYLIST_THEMES = [
  {
    name: "Short Love",
    icon: <Heart className="h-5 w-5" />,
    data: ShortLovePlaylist,
    videoPlayList: "Romactic",
  },
  {
    name: "Short Relax",
    icon: <Music className="h-5 w-5" />,
    data: ShortRelaxPlaylist,
    videoPlayList: "Relax",
  },
  {
    name: "Relax",
    icon: <Coffee className="h-5 w-5" />,
    data: RelaxPlaylist,
    videoPlayList: "Relax",
  },
  {
    name: "Sadness",
    icon: <Droplet className="h-5 w-5" />,
    data: SadnessPlaylist,
    videoPlayList: "Sadness",
  },
  {
    name: "Working | Study",
    icon: <Brain className="h-5 w-5" />,
    data: WorkingPlaylist,
    videoPlayList: "Work",
  },
  {
    name: "Sleep",
    icon: <Moon className="h-5 w-5" />,
    data: SleepPlaylist,
    videoPlayList: "Sleep",
  },
];

interface PlaylistModalProps {
  onPlaylistSelect: (playlist: Song[]) => void;
}

export function PlaylistModal({ onPlaylistSelect }: PlaylistModalProps) {
  const setSimpleItem = useGenericStore((state) => state.setSimpleItem);

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (playlist: Song[]) => {
    onPlaylistSelect(playlist);
    setIsOpen(false);
  };

  const handeSelectVideoPlaylist = (playlist: string) => {
    setSimpleItem({ name: playlist });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed right-4 z-50 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 border-orange-200 dark:border-orange-800 hover:from-orange-200 hover:to-amber-200 dark:hover:from-orange-800 dark:hover:to-amber-800 text-orange-700 dark:text-orange-300 shadow-lg"
        >
          <ListPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gradient-to-br from-orange-50/95 to-amber-50/95 dark:from-orange-950/95 dark:to-amber-950/95 backdrop-blur-md border-orange-200/50 dark:border-orange-800/50 p-0 shadow-2xl">
        <DialogHeader className="p-6 border-b border-orange-200/50 dark:border-orange-800/50">
          <DialogTitle className="text-lg font-medium text-orange-900 dark:text-orange-100">
            Choose one playlist
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 grid grid-cols-2 gap-4">
          {PLAYLIST_THEMES.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                handleSelect(theme.data);
                handeSelectVideoPlaylist(theme.videoPlayList);
              }}
              className="group flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-br from-white/50 to-orange-50/50 dark:from-black/20 dark:to-orange-950/50 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-orange-400/50 dark:hover:border-orange-600/50"
            >
              <div className="text-orange-600 dark:text-orange-400 transition-colors group-hover:text-orange-500 dark:group-hover:text-orange-300">
                {theme.icon}
              </div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200 transition-colors group-hover:text-orange-900 dark:group-hover:text-orange-100">
                {theme.name}
              </p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
