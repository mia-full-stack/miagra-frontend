"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: any | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<any | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket: any = null;

    const connectSocket = async () => {
      if (user && typeof window !== "undefined") {
        try {
          const { io } = await import("socket.io-client");
          const token = localStorage.getItem("token");
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

          newSocket = io(API_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            forceNew: true,
            reconnection: true,
            timeout: 20000,
          });

          newSocket.on("connect", () => {
            console.log("✅ Connected to socket server");
            setSocket(newSocket);
          });

          newSocket.on("disconnect", () => {
            console.log("❌ Disconnected from socket server");
          });

          newSocket.on("connect_error", (error: any) => {
            console.error("Socket connection error:", error);
          });
        } catch (error) {
          console.error("Error importing socket.io-client:", error);
        }
      }
    };

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.close();
        setSocket(null);
      }
    };
  }, [user]);

  const value = {
    socket,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
