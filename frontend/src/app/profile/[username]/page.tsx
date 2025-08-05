"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Settings, Grid, Bookmark, MoreHorizontal } from "lucide-react"

import { useAuth } from "../../../contexts/AuthContext"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "../../../components/Sidebar"
import BackToHome from "../../../components/BackToHome"
import styles from "./profile.module.css"

interface User {
  _id: string
  username: string
  fullName: string
  email: string
  profilePicture?: string
  bio?: string
  website?: string
  isPrivate: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing?: boolean
  isOwnProfile?: boolean
}

interface Post {
  _id: string
  image: string
  caption: string
  likes: string[]
  comments: any[]
  createdAt: string
  author: {
    username: string
    fullName: string
    profilePicture?: string
  }
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { user: currentUser, loading: authLoading } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login")
      return
    }
  }, [currentUser, authLoading, router])

  useEffect(() => {
    if (username && currentUser && !authLoading) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [username, currentUser, authLoading])

  const fetchUserProfile = async () => {
    try {
      setError(null)
      console.log(`Fetching profile for: ${username}`)

      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/users/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Profile response:", response.data)
      setUser(response.data)
      setIsFollowing(response.data.isFollowing || false)
    } catch (error: any) {
      console.error("Error fetching user profile:", error)
      if (error.response?.status === 404) {
        setError("User not found")
      } else {
        setError("Failed to load profile")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      console.log(`Fetching posts for: ${username}`)

      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/posts/user/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Posts response:", response.data)
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching user posts:", error)
    }
  }

  const handleFollow = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")

      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/users/${user._id}/follow`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUser((prev) => (prev ? { ...prev, followersCount: prev.followersCount - 1 } : null))
      } else {
        await axios.post(
          `http://localhost:5000/api/users/${user._id}/follow`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setUser((prev) => (prev ? { ...prev, followersCount: prev.followersCount + 1 } : null))
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <BackToHome title="Home" />
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <BackToHome title="Home" />
          <div className={styles.notFound}>
            <h2>{error || "User not found"}</h2>
            <p>Sorry, this page isn't available.</p>
            <p>The link you followed may be broken, or the page may have been removed.</p>
            <Link href="/" className={styles.goHomeBtn}>
              Go back to Home
            </Link>
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

        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={user.username}
                    width={150}
                    height={150}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>{user.fullName.charAt(0).toUpperCase()}</div>
                )}
              </div>
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileActions}>
                <h1 className={styles.username}>{user.username}</h1>

                {user.isOwnProfile ? (
                  <div className={styles.ownProfileActions}>
                    <Link href="/settings" className={styles.editProfileBtn}>
                      Edit Profile
                    </Link>
                    <button className={styles.settingsBtn}>
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.otherProfileActions}>
                    <button
                      onClick={handleFollow}
                      className={`${styles.followBtn} ${isFollowing ? styles.following : ""}`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <Link href={`/messages?user=${user.username}`} className={styles.messageBtn}>
                      Message
                    </Link>
                    <button className={styles.moreBtn}>
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{user.postsCount}</span>
                  <span className={styles.statLabel}>posts</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{user.followersCount}</span>
                  <span className={styles.statLabel}>followers</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{user.followingCount}</span>
                  <span className={styles.statLabel}>following</span>
                </div>
              </div>

              <div className={styles.bio}>
                <div className={styles.fullName}>{user.fullName}</div>
                {user.bio && <div className={styles.bioText}>{user.bio}</div>}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className={styles.website}>
                    {user.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "posts" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("posts")}
              >
                <Grid className="w-4 h-4" />
                <span>POSTS</span>
              </button>
              {user.isOwnProfile && (
                <button
                  className={`${styles.tab} ${activeTab === "saved" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("saved")}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>SAVED</span>
                </button>
              )}
            </div>

            <div className={styles.postsGrid}>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id} className={styles.postItem}>
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.caption || "Post"}
                      width={293}
                      height={293}
                      className={styles.postImage}
                    />
                    <div className={styles.postOverlay}>
                      <div className={styles.postStats}>
                        <span className={styles.postStat}>❤️ {post.likes.length}</span>
                        <span className={styles.postStat}>💬 {post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPosts}>
                  {user.isOwnProfile ? (
                    <>
                      <div className={styles.noPostsIcon}>📷</div>
                      <h3>Share Photos</h3>
                      <p>When you share photos, they will appear on your profile.</p>
                      <Link href="/create" className={styles.shareFirstPhotoBtn}>
                        Share your first photo
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className={styles.noPostsIcon}>📷</div>
                      <h3>No Posts Yet</h3>
                      <p>When {user.username} shares photos, you'll see them here.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
