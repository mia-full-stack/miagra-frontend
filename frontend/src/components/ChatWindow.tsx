"use client"
import axios from "axios"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketContext"

import Image from "next/image"
import styles from "./ChatWindow.module.css"

interface Message {
  _id: string
  sender: {
    _id: string
    username: string
    profilePicture?: string
  }
  recipient: string
  content: string
  createdAt: string
  isRead: boolean
}

interface ChatWindowProps {
  targetUserId: string
  targetUser?: {
    _id: string
    username: string
    fullName: string
    profilePicture?: string
  }
  onMessageSent?: () => void
}

export default function ChatWindow({ targetUserId, targetUser, onMessageSent }: ChatWindowProps) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatUser, setChatUser] = useState(targetUser)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (targetUserId) {
      fetchMessages()
      if (!chatUser) {
        fetchTargetUser()
      }
    }
  }, [targetUserId])

  useEffect(() => {
    if (socket && targetUserId && user) {
      console.log("🔌 Setting up socket listeners for chat")

      socket.emit("joinChat", { userId: user._id, targetUserId })

      const handleReceiveMessage = (message: Message) => {
        console.log("📨 Received message:", message)
        setMessages((prev) => [...prev, message])
        scrollToBottom()
      }

      socket.on("receiveMessage", handleReceiveMessage)

      return () => {
        console.log("🔌 Cleaning up socket listeners")
        socket.off("receiveMessage", handleReceiveMessage)
      }
    }
  }, [socket, targetUserId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      console.log("📋 Fetching messages with user:", targetUserId)

      const response = await axios.get(`/api/messages/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("✅ Messages fetched:", response.data)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error("❌ Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTargetUser = async () => {
    try {
      console.log("👤 Fetching target user info:", targetUserId)

      const response = await axios.get(`/api/users/profile/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("✅ Target user fetched:", response.data)
      setChatUser(response.data)
    } catch (error) {
      console.error("❌ Error fetching target user:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !user) return

    setSending(true)
    const messageText = newMessage.trim()
    setNewMessage("")

    try {
      console.log("📤 Sending message:", messageText)

      const response = await axios.post(
        "/api/messages",
        {
          recipient: targetUserId,
          content: messageText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      console.log("✅ Message sent:", response.data)

      const sentMessage = response.data.data
      setMessages((prev) => [...prev, sentMessage])

      if (onMessageSent) {
        onMessageSent()
      }

      if (socket) {
        socket.emit("sendMessage", {
          senderId: user._id,
          receiverId: targetUserId,
          content: messageText,
        })
      }

      scrollToBottom()
    } catch (error) {
      console.error("❌ Error sending message:", error)
      setNewMessage(messageText) // Восстанавливаем текст при ошибке
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const groupMessages = (messages: Message[]) => {
    const groups: Message[][] = []
    let currentGroup: Message[] = []
    let lastSenderId: string | null = null

    messages.forEach((message) => {
      if (message.sender._id !== lastSenderId) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup)
        }
        currentGroup = [message]
        lastSenderId = message.sender._id
      } else {
        currentGroup.push(message)
      }
    })

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!chatUser) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>User not found</p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessages(messages)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatUserInfo}>
          <div className={styles.chatAvatar}>
            {chatUser.profilePicture ? (
              <Image
                src={chatUser.profilePicture || "/placeholder.svg"}
                alt={chatUser.username}
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{chatUser.fullName?.charAt(0).toUpperCase() || chatUser.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.chatUserDetails}>
            <h3 className={styles.chatUserName}>{chatUser.username}</h3>
            <p className={styles.chatUserHandle}>{chatUser.fullName}</p>
          </div>
        </div>
        <button className={styles.viewProfileBtn}>View profile</button>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messageGroups.length > 0 ? (
          messageGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`${styles.messageGroup} ${group[0].sender._id === user?._id ? styles.sent : styles.received}`}
            >
              {group.map((message, messageIndex) => (
                <div key={message._id}>
                  <div
                    className={`${styles.message} ${message.sender._id === user?._id ? styles.sent : styles.received}`}
                  >
                    {message.content}
                  </div>
                  {messageIndex === group.length - 1 && (
                    <div className={styles.messageTime}>{formatTime(message.createdAt)}</div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyMessages}>
            <div className={styles.emptyIcon}>💬</div>
            <p>No messages yet</p>
            <p>Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.messageInput}>
        <form onSubmit={handleSendMessage} className={styles.inputContainer}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className={styles.textInput}
            disabled={sending}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <button type="submit" disabled={!newMessage.trim() || sending} className={styles.sendButton}>
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}
