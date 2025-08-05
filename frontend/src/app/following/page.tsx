"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import BackToHome from "../../components/BackToHome";
import styles from "./following.module.css";

interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
  isFollowing?: boolean;
}

export default function FollowingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchFollowingAndFollowers();
    }
  }, [user, authLoading]);

  const fetchFollowingAndFollowers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📋 Fetching following and followers...");

      const [followingResponse, followersResponse] = await Promise.all([
        axios.get("/api/users/following", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get("/api/users/followers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      console.log("✅ Following fetched:", followingResponse.data);
      console.log("✅ Followers fetched:", followersResponse.data);

      setFollowingUsers(followingResponse.data || []);
      setFollowers(followersResponse.data || []);
    } catch (error: any) {
      console.error("❌ Error fetching following/followers:", error);
      setError("Failed to load following/followers");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      console.log("👤 Unfollowing user:", userId);

      await axios.delete(`/api/users/${userId}/follow`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Удаляем пользователя из списка подписок
      setFollowingUsers((prev) => prev.filter((user) => user._id !== userId));

      console.log("✅ Successfully unfollowed user");
    } catch (error) {
      console.error("❌ Error unfollowing user:", error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      console.log("👤 Following user:", userId);

      await axios.post(
        `/api/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Обновляем статус подписки
      setFollowers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isFollowing: true } : user
        )
      );

      console.log("✅ Successfully followed user");
    } catch (error) {
      console.error("❌ Error following user:", error);
    }
  };

  const startChat = (targetUser: User) => {
    console.log("💬 Starting chat with:", targetUser.username);
    router.push(`/messages?user=${targetUser._id}`);
  };

  if (authLoading || loading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <BackToHome title="Home" />
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <BackToHome title="Home" />
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchFollowingAndFollowers}
              className={styles.retryBtn}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUsers = activeTab === "following" ? followingUsers : followers;

  return (
    <div className={styles.pageContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <BackToHome title="Home" />

        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Connections</h1>
            <p className={styles.subtitle}>
              Manage your following and followers
            </p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "following" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following ({followingUsers.length})
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "followers" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("followers")}
            >
              Followers ({followers.length})
            </button>
          </div>

          <div className={styles.userList}>
            {currentUsers.length > 0 ? (
              currentUsers.map((targetUser) => (
                <div key={targetUser._id} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <Link
                      href={`/profile/${targetUser.username}`}
                      className={styles.userLink}
                    >
                      <div className={styles.avatar}>
                        {targetUser.profilePicture ? (
                          <Image
                            src={
                              targetUser.profilePicture || "/placeholder.svg"
                            }
                            alt={targetUser.username}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>
                            {targetUser.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className={styles.userDetails}>
                        <h3 className={styles.username}>
                          {targetUser.username}
                        </h3>
                        <p className={styles.fullName}>{targetUser.fullName}</p>
                      </div>
                    </Link>
                  </div>

                  <div className={styles.actions}>
                    <button
                      onClick={() => startChat(targetUser)}
                      className={styles.messageBtn}
                    >
                      Message
                    </button>
                    {activeTab === "following" ? (
                      <button
                        onClick={() => handleUnfollow(targetUser._id)}
                        className={styles.unfollowBtn}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(targetUser._id)}
                        className={`${styles.followBtn} ${
                          targetUser.isFollowing ? styles.following : ""
                        }`}
                      >
                        {targetUser.isFollowing ? "Following" : "Follow Back"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>No {activeTab} yet</h3>
                <p>
                  {activeTab === "following"
                    ? "Start following people to see them here!"
                    : "No one is following you yet."}
                </p>
                {activeTab === "following" && (
                  <Link href="/search" className={styles.searchBtn}>
                    Find People
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
