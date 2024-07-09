"use client";
import React, {
  createContext,
  useEffect,
  ReactNode,
  useRef,
  useContext,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthProvider";
interface SocketContextType {
  socket: Socket | null;
}
export const SERVER_PORT = process.env
  .NEXT_PUBLIC_WEB_SOCKET_SERVER_PORT as string;
export const SocketContext = createContext<SocketContextType | null>(null);
interface SocketProviderProps {
  children: ReactNode;
}
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const socket = useRef<Socket | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      socket.current = io(SERVER_PORT, {
        query: { userId: user?.uid },
         withCredentials: true,
        extraHeaders: {
          "Content-Type": "application/json",
        },
      });
      socket.current?.on("connect", () => {
        console.log("connected to server");
      });
    }

    return () => {
      socket.current?.close();
    };
  }, [user]);
  return (
    <SocketContext.Provider value={{ socket: socket.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("using Socket must be used within a SocketProivder");

  return context.socket;
};
