"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NotificationModal } from "@/components/notification-modal"
import { Plus, Play, Pause, Square, Clock, CheckCircle, Circle, Trash2, Timer } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  timeSpent: number
  estimatedTime: number
  dueDate?: Date
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete React component",
      description: "Finish the music player component",
      completed: false,
      timeSpent: 1800, // 30 minutes in seconds
      estimatedTime: 3600, // 1 hour
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
    },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [activeTask, setActiveTask] = useState<string | null>(null)
  const [sessionTime, setSessionTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: "info" | "warning" | "error" | "success"
    title: string
    message: string
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && activeTask) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1)
        setTasks((prev) =>
          prev.map((task) => (task.id === activeTask ? { ...task, timeSpent: task.timeSpent + 1 } : task)),
        )
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, activeTask])

  useEffect(() => {
    const checkDueDates = () => {
      const now = new Date()
      tasks.forEach((task) => {
        if (task.dueDate && !task.completed) {
          const timeUntilDue = task.dueDate.getTime() - now.getTime()
          const hoursUntilDue = timeUntilDue / (1000 * 60 * 60)

          if (hoursUntilDue <= 1 && hoursUntilDue > 0) {
            setNotification({
              isOpen: true,
              type: "warning",
              title: "Task Due Soon!",
              message: `"${task.title}" is due in less than 1 hour.`,
            })
          } else if (timeUntilDue <= 0) {
            setNotification({
              isOpen: true,
              type: "error",
              title: "Task Overdue!",
              message: `"${task.title}" is now overdue.`,
            })
          }
        }
      })
    }

    const interval = setInterval(checkDueDates, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [tasks])

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
        timeSpent: 0,
        estimatedTime: 3600, // Default 1 hour
      }
      setTasks([...tasks, newTask])
      setNewTaskTitle("")
      setNewTaskDescription("")

      setNotification({
        isOpen: true,
        type: "success",
        title: "Task Added!",
        message: `"${newTask.title}" has been added to your task list.`,
      })
    }
  }

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))

    if (task && !task.completed) {
      setNotification({
        isOpen: true,
        type: "success",
        title: "Task Completed!",
        message: `Great job completing "${task.title}"!`,
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    if (activeTask === taskId) {
      setActiveTask(null)
      setIsTimerRunning(false)
    }

    if (task) {
      setNotification({
        isOpen: true,
        type: "info",
        title: "Task Deleted",
        message: `"${task.title}" has been removed from your task list.`,
      })
    }
  }

  const handleStartTimer = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    setActiveTask(taskId)
    setIsTimerRunning(true)
    setSessionTime(0)

    if (task) {
      setNotification({
        isOpen: true,
        type: "info",
        title: "Timer Started",
        message: `Started working on "${task.title}". Stay focused!`,
      })
    }
  }

  const handlePauseTimer = () => {
    setIsTimerRunning(false)
    setNotification({
      isOpen: true,
      type: "info",
      title: "Timer Paused",
      message: "Take a break! Your progress has been saved.",
    })
  }

  const handleStopTimer = () => {
    const task = tasks.find((t) => t.id === activeTask)
    setIsTimerRunning(false)
    setActiveTask(null)
    setSessionTime(0)

    if (task) {
      setNotification({
        isOpen: true,
        type: "success",
        title: "Session Complete",
        message: `Great work on "${task.title}"! You worked for ${formatTime(sessionTime)}.`,
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getTaskProgress = (task: Task) => {
    return Math.min((task.timeSpent / task.estimatedTime) * 100, 100)
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTime = tasks.reduce((acc, task) => acc + task.timeSpent, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center">
          <div className="text-3xl font-bold text-primary">{tasks.length}</div>
          <div className="text-lg text-muted-foreground mt-[-15px]">Total Tasks</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-3xl font-bold text-primary">{completedTasks}</div>
          <div className="text-lg text-muted-foreground mt-[-15px]">Completed</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-3xl font-bold text-primary">{formatTime(totalTime)}</div>
          <div className="text-lg text-muted-foreground mt-[-15px]">Time Spent</div>
        </Card>
      </div>

      {/* Active Timer */}
      {activeTask && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-medium">Active Session</span>
            </div>
            <Badge variant="secondary">{formatTime(sessionTime)}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {isTimerRunning ? (
              <Button onClick={handlePauseTimer} size="sm" variant="outline">
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setIsTimerRunning(true)} size="sm">
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={handleStopTimer} size="sm" variant="outline">
              <Square className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">{tasks.find((t) => t.id === activeTask)?.title}</span>
          </div>
        </Card>
      )}

      {/* Add Task */}
      <Card className="p-4">
        <h3 className="text-2xl font-semibold">Add New Task</h3>
        <div className="space-y-3">
          <Input placeholder="Task title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
          <Input
            placeholder="Task description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <Button onClick={handleAddTask} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            <p className="text-lg">Add Task</p>
          </Button>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className={`p-4 ${task.completed ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-0.5 h-6 w-6"
                >
                  {task.completed ? <CheckCircle className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
                </Button>

                <div className="flex-1">
                  <h4 className={`text-xl font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h4>
                  {task.description && <p className="text-lg text-muted-foreground mt-1">{task.description}</p>}

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-lg text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(task.timeSpent)} / {formatTime(task.estimatedTime)}
                    </div>
                    {task.dueDate && (
                      <div className="text-lg text-muted-foreground">Due: {task.dueDate.toLocaleDateString()}</div>
                    )}
                  </div>

                  <Progress value={getTaskProgress(task)} className="mt-2 h-2" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!task.completed && (
                  <Button
                    onClick={() => handleStartTimer(task.id)}
                    size="sm"
                    variant="outline"
                    disabled={activeTask === task.id}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  )
}
