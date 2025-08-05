"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Camera, ImageIcon, X, Smile, MapPin } from "lucide-react"
import Image from "next/image"
import styles from "./CreatePost.module.css"
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

interface CreatePostProps {
  onPostCreated?: (post: Post) => void
}

interface CreatePostResponse {
  success: boolean
  message: string
  post: Post
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth()
  const [caption, setCaption] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    } else {
      setError("Please select a valid image file")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!caption.trim()) {
      setError("Please add a caption")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🚀 Creating post with caption:", caption)
      if (selectedImage) {
        console.log("🚀 Creating post with image:", selectedImage.name)
      }

      const formData = new FormData()
      formData.append("content", caption.trim())

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      console.log("📡 Sending request to:", apiClient.defaults.baseURL + "/api/posts")

      const response = await apiClient.post<CreatePostResponse>("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("✅ Post created successfully:", response.data)

      if (response.data.success && response.data.post) {
        setSuccess("Post created successfully!")
        setCaption("")
        removeImage()

        // Передаем новый пост в родительский компонент
        if (onPostCreated) {
          onPostCreated(response.data.post)
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error(response.data.message || "Failed to create post")
      }
    } catch (error: any) {
      console.error("❌ Error creating post:", error)
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      })

      let errorMessage = "Failed to create post"

      if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please check if the backend server is running on port 5000."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.createPost}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.profilePicture ? (
            <Image
              src={user.profilePicture || "/placeholder.svg"}
              alt={user.username}
              width={32}
              height={32}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className={styles.username}>{user.username}</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className={styles.textArea}
          maxLength={2200}
          disabled={isLoading}
        />

        {!imagePreview ? (
          <div
            className={`${styles.imageUpload} ${isDragOver ? styles.dragOver : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className={styles.uploadIcon} size={48} />
            <p className={styles.uploadText}>Drag photos here</p>
            <p className={styles.uploadSubtext}>or click to select from your computer</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenInput}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className={styles.imagePreview}>
            <Image
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              width={470}
              height={400}
              className={styles.previewImage}
              style={{ objectFit: "cover" }}
            />
            <button type="button" onClick={removeImage} className={styles.removeImage} disabled={isLoading}>
              <X size={16} />
            </button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.actions}>
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImageIcon size={20} />
            </button>
            <button type="button" className={styles.actionBtn} disabled={isLoading}>
              <Smile size={20} />
            </button>
            <button type="button" className={styles.actionBtn} disabled={isLoading}>
              <MapPin size={20} />
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading || !caption.trim()}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Posting...
              </div>
            ) : (
              "Share"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
