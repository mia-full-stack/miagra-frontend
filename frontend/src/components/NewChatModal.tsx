"use client"

import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import Image from "next/image"
import styles from "./NewChatModal.module.css"

interface User {
  _id: string
  username: string
  fullName: string
  profilePicture?: string
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (user: User) => void
}

export default function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"following" | "search">("following")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [followingUsers, setFollowingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchFollowingUsers()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchFollowingUsers = async () => {
    try {
      setIsLoading(true)
      console.log("📋 Fetching following users...")

      const response = await axios.get("/api/users/following", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("✅ Following users fetched:", response.data)
      setFollowingUsers(response.data)
    } catch (error) {
      console.error("❌ Error fetching following users:", error)
      setFollowingUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchUsers = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Searching users for:", searchQuery)

      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("✅ Search results:", response.data)
      setSearchResults(response.data.filter((u: User) => u._id !== user?._id))
    } catch (error) {
      console.error("❌ Error searching users:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUser = (selectedUser: User) => {
    console.log("👤 User selected for chat:", selectedUser.username)
    onSelectUser(selectedUser)
    onClose()
  }

  if (!isOpen) return null

  const currentUsers = activeTab === "following" ? followingUsers : searchResults

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>New message</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "following" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("following")}
          >
            Following ({followingUsers.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "search" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("search")}
          >
            Search Results ({searchResults.length})
          </button>
        </div>

        <div className={styles.userList}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : currentUsers.length > 0 ? (
            currentUsers.map((u) => (
              <div key={u._id} className={styles.userItem} onClick={() => handleSelectUser(u)}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {u.profilePicture ? (
                      <Image
                        src={u.profilePicture || "/placeholder.svg"}
                        alt={u.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{u.fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <p className={styles.username}>{u.username}</p>
                    <p className={styles.fullName}>{u.fullName}</p>
                  </div>
                </div>
                <button className={styles.addBtn}>+</button>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              {activeTab === "following" ? (
                <p>You're not following anyone yet. Start following people to see them here!</p>
              ) : searchQuery ? (
                <p>No users found for "{searchQuery}"</p>
              ) : (
                <p>Search for users to start a conversation</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
