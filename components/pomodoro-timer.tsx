"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw, Clock, Coffee, Target } from "lucide-react"

interface PomodoroTimerProps {
  onNotification?: (message: string) => void
}

export function PomodoroTimer({ onNotification }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "break" | "longBreak">("work")
  const [sessions, setSessions] = useState(0)
  const [customMinutes, setCustomMinutes] = useState("25")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const modeSettings = {
    work: { duration: 25, label: "Focus Time", icon: Target, color: "text-amber-600" },
    break: { duration: 5, label: "Short Break", icon: Coffee, color: "text-green-600" },
    longBreak: { duration: 15, label: "Long Break", icon: Coffee, color: "text-blue-600" },
  }

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          // Timer finished
          setIsActive(false)
          handleTimerComplete()
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, minutes, seconds])

  const handleTimerComplete = () => {
    if (mode === "work") {
      setSessions((prev) => prev + 1)
      const newSessions = sessions + 1

      if (newSessions % 4 === 0) {
        setMode("longBreak")
        setMinutes(modeSettings.longBreak.duration)
        onNotification?.("Great work! Time for a long break 🎉")
      } else {
        setMode("break")
        setMinutes(modeSettings.break.duration)
        onNotification?.("Focus session complete! Take a short break ☕")
      }
    } else {
      setMode("work")
      setMinutes(modeSettings.work.duration)
      onNotification?.("Break's over! Ready for another focus session? 💪")
    }
    setSeconds(0)
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMinutes(modeSettings[mode].duration)
    setSeconds(0)
  }

  const setCustomTimer = () => {
    const mins = Number.parseInt(customMinutes)
    if (mins > 0 && mins <= 120) {
      setMinutes(mins)
      setSeconds(0)
      setIsActive(false)
    }
  }

  const switchMode = (newMode: "work" | "break" | "longBreak") => {
    setMode(newMode)
    setMinutes(modeSettings[newMode].duration)
    setSeconds(0)
    setIsActive(false)
  }

  const CurrentIcon = modeSettings[mode].icon
  const progress =
    ((modeSettings[mode].duration * 60 - (minutes * 60 + seconds)) / (modeSettings[mode].duration * 60)) * 100

  return (
    <Card className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/90 dark:to-orange-950/90 backdrop-blur-sm border-amber-200/50 dark:border-amber-800/50 p-6 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-2xl font-medium text-amber-900 dark:text-amber-100">Pomodoro Timer</h3>
          </div>
          <div className="text-lg text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-full">
            Sessions: {sessions}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-1 p-1 bg-amber-100/50 dark:bg-amber-900/50 rounded-lg">
          {Object.entries(modeSettings).map(([key, setting]) => (
            <Button
              key={key}
              variant={mode === key ? "default" : "ghost"}
              size="sm"
              onClick={() => switchMode(key as any)}
              className={`flex-1 text-lg ${mode === key ? "bg-amber-500 text-white" : "text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800"}`}
            >
              <setting.icon className="h-3 w-3 mr-1" />
              {setting.label}
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-2">
          <div className="relative">
            <div className="font-mono font-bold text-amber-900 dark:text-amber-100">
              <p className="text-5xl">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</p>
            </div>
            <div className="w-full bg-amber-200/50 dark:bg-amber-800/50 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className={`flex items-center justify-center gap-1 text-sm ${modeSettings[mode].color}`}>
            <CurrentIcon className="h-4 w-4" />
            {modeSettings[mode].label}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={toggleTimer} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            onClick={resetTimer}
            variant="outline"
            size="sm"
            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom Timer */}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
          <Input
            type="number"
            placeholder="Minutes"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="flex-1 h-8 border-amber-200 dark:border-amber-800"
            min="1"
            max="120"
          />
          <Button
            onClick={setCustomTimer}
            size="sm"
            variant="outline"
            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 bg-transparent"
          >
            <p className="text-lg">Set</p>
          </Button>
        </div>
      </div>
    </Card>
  )
}
