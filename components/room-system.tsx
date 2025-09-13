"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MemeModal } from "@/components/meme-modal";
import { NotificationModal } from "@/components/notification-modal";
import {
  Plus,
  Search,
  Users,
  Music,
  MessageCircle,
  Send,
  Smile,
  Zap,
  Gift,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useRoomPagination } from "@/hooks/room/useRoomPagination";
import { Helper } from "@/utils/helper";
import { useRoomDetailMutation } from "@/hooks/room/useRoomDetail";
import { useLeaveRoom } from "@/hooks/room/useLeaveRoom";
import { useJoinRoom } from "@/hooks/room/useJoinRoom";
import Error from "next/error";
import LoadingScreen from "./ui/loading";

export type RoomType = "PUBLIC" | "PRIVATE";

export interface CreateRoom {
  name: string;
  description: string;
  roomType: RoomType;
  userLocalTime: string;
}
export interface Room {
  room_id: string;
  room_name: string;
  room_description: string;
  room_type: RoomType;
  room_password: string | null;
  room_createdAt: string;
  room_ownerId: string;
  memberCount: number;
}

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: Date;
  type: "message" | "meme" | "auto-meme";
}

interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

export function RoomSystem() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [rooms, setRooms] = useState<CreateRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "Alex",
      content: "This track is perfect for coding!",
      timestamp: new Date(),
      type: "message",
    },
    {
      id: "2",
      user: "Sarah",
      content: "Anyone else working on React today?",
      timestamp: new Date(),
      type: "message",
    },
  ]);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const [newMessage, setNewMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("PUBLIC");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [searchRoomId, setSearchRoomId] = useState("");
  const [foundRoom, setFoundRoom] = useState<Room | null>(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userToken = localStorage.getItem("auth_token");
  const userLocalTime = Helper.getNowTz();

  // #region handle pagination
  const roomsPerPage = 10;
  const skip = (currentPage - 1) * roomsPerPage;
  const { data: paginatinoData, isLoading: queryLoading } = useRoomPagination(
    skip,
    roomsPerPage
  );
  // #endregion

  // #region handle detail room
  const { data: detailData, onDetailRoom } = useRoomDetailMutation();
  // #endregion

  // #region handle join room
  const { onJoinRoom } = useJoinRoom();
  // #endregion

  // #region handle leave room
  const { onLeaveRoom } = useLeaveRoom();
  // #endregion

  const publicRooms = useMemo(() => {
    return paginatinoData;
  }, [paginatinoData]);
  const totalPages = Math.ceil(publicRooms?.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;

  const currentPublicRooms = publicRooms?.slice(
    indexOfFirstRoom,
    indexOfLastRoom
  );
  // go to next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // back to previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      const roomId = Math.random().toString(36).substr(2, 8).toUpperCase();
      const newRoom: CreateRoom = {
        name: roomName,
        description: roomDescription,
        roomType: roomType,
        userLocalTime: userLocalTime,
      };
      setRooms([...rooms, newRoom]);
      setRoomName("");
      setRoomDescription("");
      setRoomPassword("");
      setIsPrivateRoom(false);
      setShowCreateRoom(false);

      setNotification({
        isOpen: true,
        type: "success",
        title: "Room Created!",
        message: isPrivateRoom
          ? `Private room "${newRoom.name}" created! Room ID: ${roomId}`
          : `Public room "${newRoom.name}" created successfully!`,
      });
    }
  };

  // const handleSearchRoom = () => {
  //   const room = rooms.find(
  //     (r) => r.id.toLowerCase() === searchRoomId.toLowerCase()
  //   );
  //   if (room) {
  //     setFoundRoom(room);
  //   } else {
  //     setNotification({
  //       isOpen: true,
  //       type: "error",
  //       title: "Room Not Found",
  //       message: "No room found with that ID.",
  //     });
  //   }
  // };

  const joinRoomHandler = async (
    room: Room,
    password = ""
  ): Promise<boolean> => {
    try {
      if (!userToken) {
        throw new Error({
          statusCode: 401,
          message: "Cannot found token!",
        });
      }

      const res = await onJoinRoom({
        id: room.room_id,
        token: userToken,
        userLocalTime,
        password,
      });

      if (res.status === 201) {
        setCurrentRoom(room);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Joined Room",
          message: `Welcome to "${room.room_name}"!`,
        });
        return true;
      } else {
        if (res.status === 401) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Wrong Password",
            message: res.message || "Password incorrect.",
          });
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Join Failed",
            message: res.message || "Unable to join this room.",
          });
        }
        return false;
      }
    } catch (err: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Join Failed",
        message: err.message || "Unexpected error occurred.",
      });
      return false;
    }
  };

  const handleJoinRoom = async (room: Room) => {
    if (room.room_type === "PRIVATE") {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      await joinRoomHandler(room);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (!userToken) {
      if (!userToken) {
        throw new Error({
          statusCode: 401,
          message: "Cannot found token!",
        });
      }
    }

    try {
      await onLeaveRoom({
        id: roomId,
        token: userToken,
      });
      setCurrentRoom(null);
    } catch {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error when leave room!",
        message: "Cannot leave this room, muahehehe (￣_￣|||)",
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (!selectedRoom) return;

    if (isLocked && lockEndTime && new Date() < lockEndTime) {
      const remainingTime = Math.ceil(
        (lockEndTime.getTime() - new Date().getTime()) / 60000
      );
      setNotification({
        isOpen: true,
        type: "error",
        title: "Account Locked",
        message: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
      });
      return;
    }

    const success = await joinRoomHandler(selectedRoom, joinPassword);

    if (success) {
      setCurrentRoom(selectedRoom);
      setShowPasswordModal(false);
      setJoinPassword("");
      setPasswordAttempts(0);
      setSelectedRoom(null);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Joined Private Room",
        message: `Welcome to "${selectedRoom.room_name}"!`,
      });
    } else {
      const newAttempts = passwordAttempts + 1;
      setPasswordAttempts(newAttempts);

      if (newAttempts >= 10) {
        setIsLocked(true);
        setLockEndTime(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour
        setNotification({
          isOpen: true,
          type: "error",
          title: "Account Locked",
          message: "Too many failed attempts. Account locked for 1 hour.",
        });
      } else if (newAttempts >= 5) {
        setIsLocked(true);
        setLockEndTime(new Date(Date.now() + 60 * 1000)); // 1 minute
        setNotification({
          isOpen: true,
          type: "error",
          title: "Account Locked",
          message: "Too many failed attempts. Account locked for 1 minute.",
        });
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Wrong Password",
          message: `Incorrect password. ${5 - newAttempts} attempts remaining.`,
        });
      }
      setJoinPassword("");
    }
  };

  const handleSendMessage = () => {
    if (currentRoom && newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: "You",
        content: newMessage,
        timestamp: new Date(),
        type: "message",
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const [memeModal, setMemeModal] = useState({
    isOpen: false,
    fromUser: "",
    toUser: "",
  });
  const [autoMemeEnabled, setAutoMemeEnabled] = useState(false);

  const handleSendMeme = () => {
    if (currentRoom) {
      const memes = ["😂", "🎵", "☕", "🌙", "✨", "🎧", "💻", "🔥"];
      const randomMeme = memes[Math.floor(Math.random() * memes.length)];
      const message: Message = {
        id: Date.now().toString(),
        user: "You",
        content: randomMeme,
        timestamp: new Date(),
        type: "meme",
      };
      setMessages([...messages, message]);
    }
  };

  const handleAutoMeme = () => {
    if (currentRoom) {
      const autoMemes = [
        "🎵 *vibes intensify* 🎵",
        "☕ *sips coffee thoughtfully* ☕",
        "💻 *typing furiously* 💻",
        "🌙 *lofi mood activated* 🌙",
        "✨ *productivity magic* ✨",
        "🔥 *this beat hits different* 🔥",
      ];
      const randomMeme =
        autoMemes[Math.floor(Math.random() * autoMemes.length)];
      const message: Message = {
        id: Date.now().toString(),
        user: "LofiBot",
        content: randomMeme,
        timestamp: new Date(),
        type: "auto-meme",
      };
      setMessages([...messages, message]);
    }
  };

  const handleSendMemeToUser = (targetUser: string) => {
    setMemeModal({
      isOpen: true,
      fromUser: "You",
      toUser: targetUser,
    });

    // Also add to chat
    const message: Message = {
      id: Date.now().toString(),
      user: "You",
      content: `🎁 Sent a meme to ${targetUser}!`,
      timestamp: new Date(),
      type: "meme",
    };
    setMessages([...messages, message]);
  };

  const handleUserClick = (userName: string) => {
    if (userName !== "You") {
      handleSendMemeToUser(userName);
    }
  };

  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (currentRoom && userToken) {
        await onDetailRoom({
          token: userToken,
          roomId: currentRoom.room_id,
          dto: {},
        });
        setIsLoading(false);
      }
    };
    fetchRoomDetail();
  }, [currentRoom, userToken, onDetailRoom]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (currentRoom) {
    return (
      <div className="space-y-4">
        {/* Room Header */}
        <div className="text-2xl flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">
              {detailData?.name}
            </h3>
            <p className="text-lg text-muted-foreground">
              {detailData?.description}
            </p>
          </div>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => handleLeaveRoom(detailData?.id)}
          >
            <p className="text-lg">Leave Room</p>
          </Button>
        </div>

        {/* Current Track */}
        <Card className="p-3 bg-primary/10">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <span className="text-lg font-medium">Now Playing:</span>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="text-lg font-medium">Chat</span>
              <Badge variant="secondary" className="text-sm">
                {detailData?.members.length} users
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={autoMemeEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoMemeEnabled(!autoMemeEnabled)}
                className="gap-1"
              >
                <Zap className="h-3 w-3" />
                <p className="text-lg">Auto Meme</p>
              </Button>
              <Button
                onClick={handleAutoMeme}
                size="sm"
                variant="outline"
                className="gap-1 bg-transparent"
              >
                <Gift className="h-3 w-3" />
                <p className="text-lg">Send Meme</p>
              </Button>
            </div>
          </div>

          <ScrollArea className="h-64 mb-4">
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-2">
                  <span
                    className={`font-medium text-primary text-lg cursor-pointer hover:underline ${
                      message.user !== "You" ? "hover:text-secondary" : ""
                    }`}
                    onClick={() => handleUserClick(message.user)}
                    title={
                      message.user !== "You" ? "Click to send a meme!" : ""
                    }
                  >
                    {message.user}:
                  </span>
                  <span
                    className={`text-lg ${
                      message.type === "meme" || message.type === "auto-meme"
                        ? "text-2xl"
                        : ""
                    } ${message.type === "auto-meme" ? "text-secondary" : ""}`}
                  >
                    {message.content}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMeme} variant="outline" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Online Users */}
        <Card className="p-4">
          <h4 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Online Users
          </h4>
          <div className="flex flex-wrap gap-2">
            {detailData?.members.map((member: any) => (
              <Badge
                key={member.id}
                variant="secondary"
                className={`text-lg cursor-pointer hover:bg-primary/20 transition-colors ${
                  member.role === "OWNER" ? "bg-primary text-white" : ""
                }`}
                onClick={() => handleUserClick(member.user.name)}
                title="Click to send a meme!"
              >
                {member.user.name}{" "}
                {member.role === "OWNER" && (
                  <Crown className="text-yellow-300" />
                )}
              </Badge>
            ))}
          </div>
        </Card>

        <MemeModal
          isOpen={memeModal.isOpen}
          onClose={() => setMemeModal({ ...memeModal, isOpen: false })}
          fromUser={memeModal.fromUser}
          toUser={memeModal.toUser}
        />

        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">Chat Rooms</h3>
        <Button
          onClick={() => setShowCreateRoom(true)}
          className="gap-2 cursor-pointer from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <p className="text-lg">Creat room</p>
        </Button>
      </div>

      {/* Create Room */}
      {showCreateRoom && (
        <Card className="p-6 bg-gradient-to-br from-background to-accent/20 border-primary/20 shadow-xl">
          <h3 className="font-semibold mb-4 text-2xl">Create New Room</h3>
          <div className="space-y-4">
            <Input
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-background/80 border-primary/30 focus:border-primary"
            />
            <Input
              placeholder="Room description"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              className="bg-background/80 border-primary/30 focus:border-primary"
            />

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
                ${
                  !isPrivateRoom
                    ? "from-primary/20 to-secondary/20 border-primary text-primary shadow-md"
                    : "bg-accent/30 border-muted hover:border-primary/50 hover:bg-accent/50"
                }
              `}
              >
                <input
                  type="radio"
                  name="roomType"
                  checked={!isPrivateRoom}
                  onChange={() => setIsPrivateRoom(false)}
                  className="sr-only"
                />
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    !isPrivateRoom
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }
                `}
                >
                  {!isPrivateRoom && (
                    <div className="w-2 h-2 rounded-full bg-background" />
                  )}
                </div>
                <Eye className="h-5 w-5" />
                <span className="text-[16px] font-medium">Public Room</span>
              </label>

              <label
                className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
                ${
                  isPrivateRoom
                    ? "from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md"
                    : "bg-accent/30 border-muted hover:border-primary/50 hover:bg-accent/50"
                }
              `}
              >
                <input
                  type="radio"
                  name="roomType"
                  checked={isPrivateRoom}
                  onChange={() => setIsPrivateRoom(true)}
                  className="sr-only"
                />
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    isPrivateRoom
                      ? "border-amber-500 bg-amber-500"
                      : "border-muted-foreground"
                  }
                `}
                >
                  {isPrivateRoom && (
                    <div className="w-2 h-2 rounded-full bg-background" />
                  )}
                </div>
                <Lock className="h-5 w-5" />
                <span className="text-[16px] font-medium">Private Room</span>
              </label>
            </div>

            {isPrivateRoom && (
              <div className="p-4 from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30">
                <Input
                  type="password"
                  placeholder="Enter room password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="bg-background/70 border-amber-500/30 focus:border-amber-500"
                />
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  This password will be required for users to join your private
                  room
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreateRoom}
                className="flex-1 from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <p className="text-lg">Create Room</p>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateRoom(false)}
                className="border-primary/30"
              >
                <p className="text-lg">Cancel</p>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search Room */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10 border-primary/20 shadow-lg">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Enter room ID (e.g. ABC123XY)..."
              value={searchRoomId}
              onChange={(e) => setSearchRoomId(e.target.value.toUpperCase())}
              className="pl-4 pr-4 bg-background/90 border-primary/40 focus:border-primary focus:ring-primary/20 shadow-sm"
              maxLength={15}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-sm text-muted-foreground">15 chars</span>
            </div>
          </div>
          <Button
            onClick={() => {}}
            variant="default"
            className="px-6 cursor-pointer from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
          >
            <Search className="h-4 w-4 mr-2" />
            <p className="text-lg">Search</p>
          </Button>
        </div>
        {foundRoom && (
          <div className="mt-6 p-5 bg-background/80 border border-primary/30 rounded-xl backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h5 className="font-semibold text-foreground text-lg">
                  {foundRoom.room_name}
                </h5>
                {foundRoom.room_type === "PRIVATE" && (
                  <div className="flex items-center gap-1 px-3 py-1 from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium border border-amber-500/30">
                    <Lock className="h-3 w-3" />
                    Private
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className="gap-1 bg-primary/20 text-primary border border-primary/30"
                >
                  <Users className="h-3 w-3" />
                  {foundRoom.memberCount}
                </Badge>
              </div>
              <Button
                onClick={() => handleJoinRoom(foundRoom)}
                className="from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
              >
                <p className="text-lg">Join Room</p>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3 pl-1">
              {foundRoom.room_description}
            </p>
          </div>
        )}
      </Card>

      {/* Public Room List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-2xl text-foreground">Public Rooms</h4>
        <div className="grid gap-4">
          {currentPublicRooms?.map((room: Room) => (
            <Card
              key={room.room_id}
              className="p-5 hover:bg-accent/50 transition-all duration-200 border-primary/10 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-xl">{room.room_name}</h4>
                    <Badge
                      variant="secondary"
                      className="gap-1 text-sm bg-primary/20 text-primary"
                    >
                      <Users className="h-3 w-3" />
                      {room.memberCount}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground mb-3">
                    {room.room_description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Music className="h-3 w-3" />
                    <span></span>
                  </div>
                </div>
                <Button
                  onClick={() => handleJoinRoom(room)}
                  className="from-primary cursor-pointer to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
                >
                  <p className="text-lg">Join</p>
                </Button>
              </div>
            </Card>
          ))}
          {queryLoading && <p className="text-lg">Loading rooms...</p>}
          {!queryLoading && currentPublicRooms?.length === 0 && (
            <p className="text-center text-lg text-muted-foreground py-8">
              No public rooms found.
            </p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <p className="text-lg">Previous</p>
            </Button>
            <span className="text-lg font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              <p className="text-lg">Next</p>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Password Modal for Private Rooms */}
      {showPasswordModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5" />
              <h3 className="text-xl font-semibold">Enter Password</h3>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              This is a private room. Please enter the password to join "
              {selectedRoom.room_name}".
            </p>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Room password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                disabled={
                  !!(isLocked && lockEndTime && new Date() < lockEndTime)
                }
              />
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordSubmit}
                  className="flex-1"
                  disabled={
                    !!(isLocked && lockEndTime && new Date() < lockEndTime)
                  }
                >
                  <p className="text-lg">Join Room</p>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setJoinPassword("");
                    setSelectedRoom(null);
                  }}
                >
                  <p className="text-lg">Cancel</p>
                </Button>
              </div>
              {passwordAttempts > 0 && (
                <p className="text-lg text-destructive">
                  Failed attempts: {passwordAttempts}/10
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
