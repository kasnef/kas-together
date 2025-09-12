"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus } from "lucide-react"

interface AddSongModalProps {
  onAddSong: (url: string) => void
}

export function AddSongModal({ onAddSong }: AddSongModalProps) {
  const [newUrl, setNewUrl] = useState("")

  const handleSubmit = () => {
    if (!newUrl.trim()) return
    onAddSong(newUrl.trim())
    setNewUrl("") // clear sau khi thêm
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">
            Add Song by URL
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Enter song URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Button onClick={handleSubmit}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
