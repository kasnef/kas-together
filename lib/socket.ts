import { io } from "socket.io-client";

console.log("process.env.NEXT_PUBLIC_DEV_API_URL ==> ", process.env.NEXT_PUBLIC_DEV_API_URL)

export const socket = io(process.env.NEXT_PUBLIC_DEV_API_URL, {
  transports: ["websocket"],
  autoConnect: false,        // để chủ động connect/disconnect
});