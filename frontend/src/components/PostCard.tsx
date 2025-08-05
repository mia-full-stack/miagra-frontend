// "use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../utils/axios"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from "lucide-react"
import styles from "./PostCard.module.css"

interface Post {
  _id: string
  author: {
    _id: string
    username: string
    fullName: string
    profilePicture?: string
    isVerified?: boolean
  }
  content: string
  images: {
    data: string
    contentType: string
    filename: string
    size: number
    url: string
  }[]
  likes: string[]
  comments: string[]
  createdAt: string
  updatedAt: string
}

interface PostCardProps {
  post: Post
  onUpdate?: (post: Post) => void
  onDelete?: (postId: string) => void
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ""))
  const [likesCount, setLikesCount] = useState(post.likes.length)
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLike = async () => {
    if (!user) return

    try {
      const response = await apiClient.post(`/api/posts/${post._id}/like`)

      if (response.data.success) {
        setIsLiked(response.data.isLiked)
        setLikesCount(response.data.likesCount)
      }
    } catch (error) {
      console.error("❌ Error toggling like:", error)
    }
  }

  const handleDelete = async () => {
    if (!user || post.author._id !== user._id) return

    if (!confirm("Are you sure you want to delete this post?")) return

    setIsDeleting(true)

    try {
      const response = await apiClient.delete(`/api/posts/${post._id}`)

      if (response.data.success) {
        if (onDelete) {
          onDelete(post._id)
        }
      }
    } catch (error) {
      console.error("❌ Error deleting post:", error)
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  return (
    <article className={styles.postCard}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {post.author.profilePicture ? (
              <img src={post.author.profilePicture || "/placeholder.svg"} alt={post.author.username} />
            ) : (
              <div className={styles.avatarPlaceholder}>{post.author.username.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.username}>
              {post.author.username}
              {post.author.isVerified && <span className={styles.verified}>✓</span>}
            </span>
            <span className={styles.timestamp}>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        {user && post.author._id === user._id && (
          <div className={styles.menuContainer}>
            <button className={styles.menuButton} onClick={() => setShowMenu(!showMenu)}>
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className={styles.menu}>
                <button className={styles.menuItem} onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 size={16} />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <p className={styles.text}>{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className={styles.images}>
            {post.images.length === 1 ? (
              <div className={styles.singleImage}>
                <img src={post.images[0].url || "/placeholder.svg"} alt="Post image" />
              </div>
            ) : (
              <div className={`${styles.multipleImages} ${styles[`grid${post.images.length}`]}`}>
                {post.images.map((image, index) => (
                  <div key={index} className={styles.imageContainer}>
                    <img src={image.url || "/placeholder.svg"} alt={`Post image ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <div className={styles.leftActions}>
          <button className={`${styles.actionButton} ${isLiked ? styles.liked : ""}`} onClick={handleLike}>
            <Heart size={24} fill={isLiked ? "#ed4956" : "none"} />
          </button>

          <button className={styles.actionButton}>
            <MessageCircle size={24} />
          </button>

          <button className={styles.actionButton}>
            <Send size={24} />
          </button>
        </div>

        <button className={styles.actionButton}>
          <Bookmark size={24} />
        </button>
      </div>

      <div className={styles.stats}>
        {likesCount > 0 && (
          <span className={styles.likes}>
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </span>
        )}
      </div>
    </article>
  )
}
