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
  compilingSocket: WebSocket | null;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SERVER_PORT = process.env.NEXT_PUBLIC_SERVER_001 as string;
const COMPILING_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_002 as string;

const SocketContext = createContext<SocketContextType | null>(null);

const socketConfig = {
  transports: ["websocket", "polling"],
  withCredentials: true,
  extraHeaders: {
    "Content-Type": "application/json",
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  randomizationFactor: 0,
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const socketRef = useRef<Socket | null>(null);
  const compilingSocketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeMainSocket();
    }
    initializeCompilingSocket();

    return () => {
      socketRef.current?.close();
      compilingSocketRef.current?.close();
    };
  }, [user]);

  const initializeMainSocket = () => {
    socketRef.current = io(SERVER_PORT, {
      ...socketConfig,
      query: { userId: user?.uid },
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to main server");
    });
  };

  const initializeCompilingSocket = () => {
    const wss = new WebSocket(COMPILING_SERVER_URL);
    wss.addEventListener("open", () => {
      console.log("Compiling Server connection established");
    });
    compilingSocketRef.current = wss;
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        compilingSocket: compilingSocketRef.current,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export { SERVER_PORT };
