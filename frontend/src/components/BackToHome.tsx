"use client"

import { ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./BackToHome.module.css"

interface BackToHomeProps {
  title?: string
  className?: string
}

export default function BackToHome({ title = "Home", className = "" }: BackToHomeProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <button onClick={handleBack} className={styles.backButton}>
        <ArrowLeft className={styles.icon} />
        <span className={styles.text}>Back</span>
      </button>

      <Link href="/" className={styles.homeButton}>
        <Home className={styles.icon} />
        <span className={styles.text}>{title}</span>
      </Link>
    </div>
  )
}
