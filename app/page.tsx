"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { VideoBackground } from "@/components/video-background";
import { MusicPlayer } from "@/components/music-player";
import { UnifiedMenu } from "@/components/unified-menu";
import { RoomSystem } from "@/components/room-system";
import { TaskManager } from "@/components/task-manager";
import {
  Play,
  Users,
  CheckSquare,
  Coffee,
  Github,
  Send,
  Linkedin,
  HandCoins,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<
    "music" | "rooms" | "tasks"
  >("music");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground currentTrack={currentTrack} />

      <UnifiedMenu currentTrack={currentTrack} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-20">
        <header className="glass-effect border-b border-border/50 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-pixel text-foreground">Lofi Cafe</h1>
            </div>

            <nav className="flex items-center gap-4">
              <Button
                variant={activeSection === "music" ? "default" : "ghost"}
                onClick={() => setActiveSection("music")}
                className="gap-2 font-pixel text-lg"
              >
                <Play className="h-4 w-4" />
                Music
              </Button>
              <Button
                variant={activeSection === "rooms" ? "default" : "ghost"}
                onClick={() => setActiveSection("rooms")}
                className="gap-2 font-pixel text-lg"
              >
                <Users className="h-4 w-4" />
                Rooms
              </Button>
              <Button
                variant={activeSection === "tasks" ? "default" : "ghost"}
                onClick={() => setActiveSection("tasks")}
                className="gap-2 font-pixel text-lg"
              >
                <CheckSquare className="h-4 w-4" />
                Tasks
              </Button>

              <div className="flex items-center gap-2 ml-4 border-l border-border/50 pl-4">
                <ThemeToggle />

                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://github.com/kasnef"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://t.me/kasnef"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegram"
                  >
                    <Send className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://www.linkedin.com/in/kasnef/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://www.calangthang.net/en/support-me"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <HandCoins className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            {activeSection === "rooms" && (
              <Card className="glass-effect p-6 lofi-glow">
                <RoomSystem />
              </Card>
            )}

            {activeSection === "tasks" && (
              <Card className="glass-effect p-6 lofi-glow">
                <h2 className="text-xl font-pixel mb-6 text-card-foreground">
                  Task Manager
                </h2>
                <TaskManager />
              </Card>
            )}
          </div>
        </main>
      </div>

      <MusicPlayer onTrackChange={setCurrentTrack} />
    </div>
  );
}
