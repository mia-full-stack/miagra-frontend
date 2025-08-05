"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import { Edit, Search } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import Image from "next/image"
import NewChatModal from "./NewChatModal"
import styles from "./ChatList.module.css"

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

interface User {
  _id: string
  username: string
  fullName: string
  profilePicture?: string
}

interface ChatListProps {
  onSelectChat: (chat: Chat) => void
  selectedChatId?: string
}

export default function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      setIsLoading(true)
      console.log("📋 Fetching chats...")

      const response = await axios.get("/api/messages/chats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("✅ Chats fetched:", response.data)
      setChats(response.data.chats || [])
    } catch (error) {
      console.error("❌ Error fetching chats:", error)
      setChats([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async (selectedUser: User) => {
    try {
      console.log("💬 Creating new chat with:", selectedUser.username)

      // Проверяем, есть ли уже чат с этим пользователем
      const existingChat = chats.find((chat) => chat.user._id === selectedUser._id)

      if (existingChat) {
        console.log("✅ Chat already exists, selecting it")
        onSelectChat(existingChat)
        return
      }

      // Создаем новый чат (отправляем первое сообщение)
      const newChat: Chat = {
        _id: `temp-${selectedUser._id}`,
        user: selectedUser,
        lastMessage: undefined,
        unreadCount: 0,
      }

      setChats([newChat, ...chats])
      onSelectChat(newChat)

      console.log("✅ New chat created")
    } catch (error) {
      console.error("❌ Error creating chat:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "now"
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString()
  }

  const filteredChats = chats.filter((chat) => {
    return (
      chat.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{user?.username}</h2>
          <button className={styles.newChatBtn} onClick={() => setShowNewChatModal(true)} title="New message">
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.chatList}>
        {isLoading ? (
          <div className={styles.loading}>Loading chats...</div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const isSelected = selectedChatId === chat._id

            return (
              <div
                key={chat._id}
                className={`${styles.chatItem} ${isSelected ? styles.chatItemActive : ""}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className={styles.avatar}>
                  {chat.user.profilePicture ? (
                    <Image
                      src={chat.user.profilePicture || "/placeholder.svg"}
                      alt={chat.user.username}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{chat.user.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <span className={styles.username}>{chat.user.username}</span>
                    {chat.lastMessage && <span className={styles.time}>{formatTime(chat.lastMessage.createdAt)}</span>}
                  </div>

                  <div className={styles.lastMessage}>
                    {chat.lastMessage ? (
                      <span className={styles.messageText}>
                        {chat.lastMessage.sender === user?._id ? "You: " : ""}
                        {chat.lastMessage.content}
                      </span>
                    ) : (
                      <span className={styles.noMessages}>No messages yet</span>
                    )}
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className={styles.empty}>
            <p>No messages, yet.</p>
            <button className={styles.sendMessageBtn} onClick={() => setShowNewChatModal(true)}>
              Send Message
            </button>
          </div>
        )}
      </div>

      <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} onSelectUser={handleNewChat} />
    </div>
  )
}
