"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

export function UsernameModal({
  onSubmit,
  forceOpen = false,
}: {
  onSubmit: (username: string) => void;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(forceOpen);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const handleConfirm = () => {
    if (username.trim()) {
      onSubmit(username);
      setUsername("");
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {}} // Prevent closing
    >
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md" />
      <DialogContent
        className="sm:max-w-md bg-white/80 dark:bg-zinc-900/20 
            backdrop-blur-md border border-zinc-200/50 
            dark:border-zinc-800/50 shadow-2xl"
        showCloseButton={false} // Remove close button
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent escape key
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent outside clicks
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Enter your username
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            autoFocus
            placeholder="Type your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && username.trim()) {
                handleConfirm();
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!username.trim()}
            className="w-full"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
