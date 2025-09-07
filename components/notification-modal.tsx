"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  autoClose?: boolean
  duration?: number
}

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  duration = 3000,
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, duration, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case "info":
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500/50"
      case "error":
        return "border-red-500/50"
      case "warning":
        return "border-yellow-500/50"
      case "info":
      default:
        return "border-blue-500/50"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`relative p-6 max-w-md w-full mx-4 glass-effect lofi-glow ${getBorderColor()}`}>
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 h-6 w-6">
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
