"use client"

import { useState, useEffect } from "react"
import { SearchIcon, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import axios from "axios"
import Sidebar from "../../components/Sidebar"
import BackToHome from "../../components/BackToHome"
import Image from "next/image"
import Link from "next/link"
import styles from "./search.module.css"

interface User {
  _id: string
  username: string
  fullName: string
  profilePicture?: string
}

export default function Search() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<User[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setUsers([])
    }
  }, [query])

  const searchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/users/search?query=${encodeURIComponent(query)}`)
      setUsers(response.data)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToRecentSearches = (user: User) => {
    const updated = [user, ...recentSearches.filter((u) => u._id !== user._id)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const removeFromRecentSearches = (userId: string) => {
    const updated = recentSearches.filter((u) => u._id !== userId)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const clearAllRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <BackToHome title="Home" />

        <div className={styles.searchContainer}>
          {/* Search Header */}
          <div className={styles.searchHeader}>
            <div className={styles.searchInputContainer}>
              <SearchIcon className={styles.searchIcon} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people..."
                className={styles.searchInput}
              />
              {query && (
                <button onClick={() => setQuery("")} className={styles.clearButton}>
                  <X className={styles.clearIcon} />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {query && (
            <div className={styles.searchResults}>
              <div className={styles.resultsHeader}>
                <h3 className={styles.resultsTitle}>Search Results</h3>
              </div>
              <div className={styles.resultsList}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                  </div>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <Link
                      key={user._id}
                      href={`/profile/${user.username}`}
                      onClick={() => addToRecentSearches(user)}
                      className={styles.userResult}
                    >
                      <div className={styles.userAvatar}>
                        {user.profilePicture ? (
                          <Image
                            src={user.profilePicture || "/placeholder.svg"}
                            alt={user.username}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            <span>{user.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <p className={styles.username}>{user.username}</p>
                        <p className={styles.fullName}>{user.fullName}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    <SearchIcon className={styles.noResultsIcon} />
                    <p>No users found for "{query}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className={styles.recentSearches}>
              <div className={styles.recentHeader}>
                <h3 className={styles.recentTitle}>Recent</h3>
                <button onClick={clearAllRecentSearches} className={styles.clearAllButton}>
                  Clear all
                </button>
              </div>
              <div className={styles.recentList}>
                {recentSearches.map((user) => (
                  <div key={user._id} className={styles.recentItem}>
                    <Link href={`/profile/${user.username}`} className={styles.recentUser}>
                      <div className={styles.userAvatar}>
                        {user.profilePicture ? (
                          <Image
                            src={user.profilePicture || "/placeholder.svg"}
                            alt={user.username}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            <span>{user.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <p className={styles.username}>{user.username}</p>
                        <p className={styles.fullName}>{user.fullName}</p>
                      </div>
                    </Link>
                    <button onClick={() => removeFromRecentSearches(user._id)} className={styles.removeButton}>
                      <X className={styles.removeIcon} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className={styles.emptyState}>
              <SearchIcon className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Search for people</h3>
              <p className={styles.emptyText}>Start typing to find users on Miagra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
