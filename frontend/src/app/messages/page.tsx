"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useSocket } from "../../contexts/SocketContext"
import { useSearchParams } from "next/navigation"
import Sidebar from "../../components/Sidebar"
import BackToHome from "../../components/BackToHome"
import ChatList from "../../components/ChatList"
import ChatWindow from "../../components/ChatWindow"
import styles from "./messages.module.css"

interface Chat {
  _id: string
  user: {
    _id: string
    username: string
    fullName: string
    profilePicture?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
    sender: string
  }
  unreadCount?: number
}

export default function Messages() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const searchParams = useSearchParams()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем, есть ли параметр user в URL для прямого перехода к чату
    const userId = searchParams.get("user")
    if (userId && user) {
      // Создаем временный чат для прямого перехода
      const directChat: Chat = {
        _id: `direct-${userId}`,
        user: {
          _id: userId,
          username: "Loading...",
          fullName: "Loading...",
        },
      }
      setSelectedChat(directChat)
    }
    setLoading(false)
  }, [searchParams, user])

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", () => {
        // Обновляем список чатов при получении нового сообщения
        console.log("📨 New message received, refreshing chat list")
      })

      return () => {
        socket.off("receiveMessage")
      }
    }
  }, [socket])

  const handleSelectChat = (chat: Chat) => {
    console.log("💬 Selected chat:", chat)
    setSelectedChat(chat)
  }

  const handleMessageSent = () => {
    console.log("📤 Message sent, refreshing chat list")
    // Здесь можно обновить список чатов
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <BackToHome title="Home" />

        <div className={styles.messagesContainer}>
          <div className={styles.chatList}>
            <ChatList onSelectChat={handleSelectChat} selectedChatId={selectedChat?._id} />
          </div>
          <div className={styles.chatWindow}>
            {selectedChat ? (
              <ChatWindow
                targetUserId={selectedChat.user._id}
                targetUser={selectedChat.user}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>💬</div>
                <h3 className={styles.emptyStateTitle}>Your Messages</h3>
                <p className={styles.emptyStateText}>Send private photos and messages to a friend or group.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
