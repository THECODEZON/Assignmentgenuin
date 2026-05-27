import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const connectSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
