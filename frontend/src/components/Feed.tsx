"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import CreatePost from "./CreatePost"
import PostCard from "./PostCard"
import styles from "./Feed.module.css"
import apiClient from "../utils/axios"

interface User {
  _id: string
  username: string
  fullName: string
  profilePicture?: string
  isVerified?: boolean
}

interface Comment {
  _id: string
  author: User
  content: string
  createdAt: string
}

interface Post {
  _id: string
  author: User
  content: string
  images: string[]
  likes: string[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching posts...")

      const response = await apiClient.get("/api/posts")

      console.log("✅ Posts fetched successfully:", response.data)

      if (response.data.success && response.data.posts) {
        setPosts(response.data.posts)
      } else if (Array.isArray(response.data)) {
        setPosts(response.data)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      console.error("❌ Error fetching posts:", error)
      setError(error.response?.data?.message || error.message || "Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  const handleNewPost = (newPost: Post) => {
    console.log("📝 Adding new post to feed:", newPost)
    setPosts((prevPosts) => [newPost, ...prevPosts])
  }

  const handlePostUpdate = (updatedPost: Post) => {
    console.log("🔄 Updating post in feed:", updatedPost._id)
    setPosts((prevPosts) => prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)))
  }

  const handlePostDelete = (postId: string) => {
    console.log("🗑️ Removing post from feed:", postId)
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId))
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/like`)

      if (response.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              const isLiked = response.data.isLiked
              const newLikes = isLiked ? [...post.likes, user!._id] : post.likes.filter((id) => id !== user!._id)

              return { ...post, likes: newLikes }
            }
            return post
          }),
        )
      }
    } catch (error: any) {
      console.error("❌ Error toggling like:", error)
    }
  }

  if (!user) {
    return (
      <div className={styles.feed}>
        <div className={styles.loginPrompt}>
          <h2>Welcome to Miagra</h2>
          <p>Please log in to see your feed</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.feed}>
      <CreatePost onPostCreated={handleNewPost} />

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading posts...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <h3>Failed to load posts</h3>
          <p>{error}</p>
          <button onClick={fetchPosts} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className={styles.noPosts}>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className={styles.postsContainer}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onUpdate={handlePostUpdate}
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
