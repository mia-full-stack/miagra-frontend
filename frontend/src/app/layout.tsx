import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../contexts/AuthContext"
import { SocketProvider } from "../contexts/SocketContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Miagra - Share Your Moments",
  description: "Instagram-like social media app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
