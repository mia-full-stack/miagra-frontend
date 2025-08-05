"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"

interface SocketContextType {
  socket: Socket | null
  onlineUsers: string[]
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      console.log("Connecting to socket server:", API_URL)

      const newSocket = io(API_URL, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
      })

      newSocket.on("connect", () => {
        console.log("✅ Connected to socket server")
      })

      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected from socket server")
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      setSocket(newSocket)

      return () => {
        console.log("Closing socket connection")
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [user])

  const value = {
    socket,
    onlineUsers,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
