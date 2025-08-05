"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { Home, Search, MessageCircle, Heart, PlusSquare, User, Menu, Users, LogOut, Settings } from "lucide-react"
import Image from "next/image"
import styles from "./Sidebar.module.css"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/notifications", icon: Heart, label: "Notifications" },
    { href: "/create", icon: PlusSquare, label: "Create" },
    { href: "/following", icon: Users, label: "Following" },
    { href: `/profile/${user?.username}`, icon: User, label: "Profile" },
  ]

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoLink}>
          <h1>Miagra</h1>
        </Link>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
              <Icon className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture || "/placeholder.svg"}
                alt={user.username}
                width={32}
                height={32}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.userDetails}>
            <p className={styles.username}>{user?.username}</p>
            <p className={styles.fullName}>{user?.fullName}</p>
          </div>
        </div>

        <div className={styles.menuContainer}>
          <button className={styles.menuButton} onClick={() => setShowMenu(!showMenu)}>
            <Menu className={styles.menuIcon} />
          </button>

          {showMenu && (
            <div className={styles.dropdown}>
              <Link href="/settings" className={styles.dropdownItem}>
                <Settings className={styles.dropdownIcon} />
                Settings
              </Link>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <LogOut className={styles.dropdownIcon} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
