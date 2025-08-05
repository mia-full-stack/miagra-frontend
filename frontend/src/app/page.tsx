"use client"

import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import ServerStatus from "../components/ServerStatus"
import styles from "./page.module.css"

const Feed = dynamic(() => import("../components/Feed"), { ssr: false })
const Sidebar = dynamic(() => import("../components/Sidebar"), { ssr: false })

function WelcomePage() {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeCard}>
        <h1 className={styles.logo}>Miagra</h1>
        <p className={styles.subtitle}>Share your moments with the world</p>

        <div className={styles.buttonContainer}>
          <Link href="/login" className={styles.loginButton}>
            Log In
          </Link>
          <Link href="/register" className={styles.signupButton}>
            Sign Up
          </Link>
        </div>

        <p className={styles.description}>Join millions of people sharing their stories</p>

        <div className={styles.statusContainer}>
          <ServerStatus />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <WelcomePage />
  }

  return (
    <div className={styles.mainApp}>
      <div className={styles.appContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <Feed />
        </main>
      </div>
    </div>
  )
}
