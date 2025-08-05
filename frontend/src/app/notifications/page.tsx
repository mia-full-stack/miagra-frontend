"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"

import Sidebar from "../../components/Sidebar"
import BackToHome from "../../components/BackToHome"
import Image from "next/image"
import Link from "next/link"
import styles from "./notifications.module.css"

interface Notification {
  _id: string
  type: "like" | "comment" | "follow"
  sender: {
    _id: string
    username: string
    fullName: string
    profilePicture?: string
  }
  post?: {
    _id: string
    image: string
    caption: string
  }
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && !authLoading) {
      fetchNotifications()
    }
  }, [user, authLoading])

  const fetchNotifications = async () => {
    try {
      setError(null)
      console.log("📡 Fetching notifications...")

      const response = await axios.get("/api/notifications")
      console.log("✅ Notifications received:", response.data.length)

      setNotifications(response.data)
    } catch (error: any) {
      console.error("❌ Error fetching notifications:", error)
      if (error.response?.status === 404) {
        setError("Notifications not found")
      } else if (error.response?.status === 401) {
        setError("Please log in to view notifications")
        router.push("/login")
      } else {
        setError("Failed to load notifications")
      }
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/mark-all-read")
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️"
      case "comment":
        return "💬"
      case "follow":
        return "👤"
      default:
        return "🔔"
    }
  }

  if (authLoading || loading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <BackToHome title="Notifications" />
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <BackToHome title="Notifications" />
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchNotifications} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <BackToHome title="Notifications" />

        <div className={styles.notificationsContainer}>
          <div className={styles.header}>
            <h1>Notifications</h1>
            {notifications.some((n) => !n.isRead) && (
              <button onClick={markAllAsRead} className={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <h3>No notifications yet</h3>
              <p>When someone likes or comments on your posts, you'll see it here.</p>
            </div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ""}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className={styles.notificationContent}>
                    <div className={styles.avatar}>
                      {notification.sender.profilePicture ? (
                        <Image
                          src={notification.sender.profilePicture || "/placeholder.svg"}
                          alt={notification.sender.username}
                          width={40}
                          height={40}
                          className={styles.avatarImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {notification.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className={styles.notificationText}>
                      <div className={styles.message}>
                        <Link href={`/profile/${notification.sender.username}`} className={styles.username}>
                          {notification.sender.username}
                        </Link>
                        <span className={styles.action}> {notification.message}</span>
                        <span className={styles.time}>{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>

                    <div className={styles.notificationMeta}>
                      <span className={styles.typeIcon}>{getNotificationIcon(notification.type)}</span>
                      {notification.post && (
                        <div className={styles.postThumbnail}>
                          <Image
                            src={notification.post.image || "/placeholder.svg"}
                            alt="Post"
                            width={40}
                            height={40}
                            className={styles.postImage}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification._id)
                      }}
                      className={styles.deleteBtn}
                      aria-label="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
