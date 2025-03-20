import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_APP_BACKEND_URL, {
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};