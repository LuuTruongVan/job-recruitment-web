import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"], // ổn định hơn
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
