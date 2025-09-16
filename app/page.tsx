"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { VideoBackground } from "@/components/video-background"
import { MusicPlayer } from "@/components/music-player"
import { UnifiedMenu } from "@/components/unified-menu"
import { RoomSystem, type Room } from "@/components/room-system"
import { TaskManager } from "@/components/task-manager"
import { Play, Users, CheckSquare, Coffee, Github, Send, Linkedin, HandCoins } from "lucide-react"
import type { Song } from "@/data/music-playlist"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<"music" | "rooms" | "tasks">("music")
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false)

  const musicPlayerRef = useRef<any>(null)

  useEffect(() => {
    const hasUsername = localStorage.getItem("username")
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")

    if (hasUsername && !hasSeenWelcome) {
      setShowWelcomeOverlay(true)
    }
  }, [])

  const handleWelcomeClick = () => {
    localStorage.setItem("hasSeenWelcome", "true")
    setShowWelcomeOverlay(false)

    if (musicPlayerRef.current && musicPlayerRef.current.startPlayback) {
      musicPlayerRef.current.startPlayback()
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground currentTrack={currentTrack} />

      <UnifiedMenu currentTrack={currentTrack} />

      {showWelcomeOverlay && (
        <div
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm cursor-pointer flex items-center justify-center"
          onClick={handleWelcomeClick}
        >
          <div className="glass-effect p-8 rounded-2xl max-w-md mx-4 text-center pointer-events-none">
            <div className="mb-4">
              <Coffee className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-pixel text-primary font-bold mb-2">Welcome to Lofi Cafe</h2>
              <p className="text-muted-foreground">Click anywhere to start your lofi journey</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Play className="h-4 w-4" />
              <span>Music will start automatically</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen pb-20">
        <header className="glass-effect border-b border-border/50 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-pixel text-primary font-bold">Lofi Cafe</h1>
            </div>

            <nav className="flex items-center gap-4">
              <Button
                variant={activeSection === "music" ? "default" : "ghost"}
                onClick={() => setActiveSection("music")}
                className={`cursor-pointer gap-2 font-pixel text-lg ${
                  activeSection !== "music" ? "text-primary hover:text-primary-foreground" : ""
                }`}
              >
                <Play className="h-4 w-4" />
                Music
              </Button>
              <Button
                variant={activeSection === "rooms" ? "default" : "ghost"}
                onClick={() => setActiveSection("rooms")}
                className={`cursor-pointer gap-2 font-pixel text-lg ${
                  activeSection !== "rooms" ? "text-primary hover:text-primary-foreground" : ""
                }`}
              >
                <Users className="h-4 w-4" />
                Rooms
              </Button>
              <Button
                variant={activeSection === "tasks" ? "default" : "ghost"}
                onClick={() => setActiveSection("tasks")}
                className={`cursor-pointer gap-2 font-pixel text-lg ${
                  activeSection !== "tasks" ? "text-primary hover:text-primary-foreground" : ""
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                Tasks
              </Button>

              <div className="flex items-center gap-2 ml-4 border-l border-border/50 pl-4">
                <div className="text-primary">
                  <ThemeToggle />
                </div>

                <Button
                  className="cursor-pointer text-primary hover:text-primary-foreground"
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href="https://github.com/kasnef" target="_blank" rel="noopener noreferrer" title="GitHub">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  className="cursor-pointer text-primary hover:text-primary-foreground"
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href="https://t.me/kasnef" target="_blank" rel="noopener noreferrer" title="Telegram">
                    <Send className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  className="cursor-pointer text-primary hover:text-primary-foreground"
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a
                    href="https://www.linkedin.com/in/kasnef/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  className="cursor-pointer text-primary hover:text-primary-foreground"
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a
                    href="https://www.calangthang.net/en/support-me"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Support me"
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
                <RoomSystem currentRoom={currentRoom} setCurrentRoom={setCurrentRoom} />
              </Card>
            )}

            {activeSection === "tasks" && (
              <Card className="glass-effect p-6 lofi-glow">
                <h2 className="text-xl font-pixel mb-6 text-card-foreground">Task Manager</h2>
                <TaskManager />
              </Card>
            )}
          </div>
        </main>
      </div>

      <MusicPlayer onTrackChange={setCurrentTrack} ref={musicPlayerRef} />
    </div>
  )
}
