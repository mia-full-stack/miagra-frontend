"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios, { type AxiosResponse } from "axios"

// Интерфейс пользователя
export interface User {
  _id: string
  username: string
  email: string
  fullName: string
  bio?: string
  profilePicture?: string
  website?: string
  isPrivate?: boolean
  createdAt: string
}

// Интерфейс контекста аутентификации
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

// Интерфейс данных регистрации
interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
}

// Интерфейс ответа от API
interface AuthResponse {
  token: string
  user: User
  message: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Настройка Axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Настройка interceptors для автоматического добавления токена
  useEffect(() => {
    // Request interceptor - добавляем токен к каждому запросу
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const currentToken = token || localStorage.getItem("token")
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor - обрабатываем 401 ошибки
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log("🔐 Unauthorized access, logging out...")
          logout()
        }
        return Promise.reject(error)
      },
    )

    // Cleanup interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [token])

  // Проверка токена при загрузке приложения
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")

        console.log("🔍 Checking saved auth data...")
        console.log("Token exists:", !!savedToken)
        console.log("User exists:", !!savedUser)

        if (savedToken && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setToken(savedToken)
            setUser(parsedUser)

            // Проверяем валидность токена
            const response: AxiosResponse<{ user: User }> = await api.get("/api/auth/verify")
            setUser(response.data.user)
            console.log("✅ Token verified, user authenticated:", response.data.user.username)
          } catch (error) {
            console.log("❌ Token verification failed, clearing auth data")
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setToken(null)
            setUser(null)
          }
        } else {
          console.log("📝 No saved auth data found")
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error)
        // Очищаем поврежденные данные
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Синхронизация токена с localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token)
      console.log("💾 Token saved to localStorage")
    } else {
      localStorage.removeItem("token")
      console.log("🗑️ Token removed from localStorage")
    }
  }, [token])

  // Синхронизация пользователя с localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
      console.log("💾 User saved to localStorage:", user.username)
    } else {
      localStorage.removeItem("user")
      console.log("🗑️ User removed from localStorage")
    }
  }, [user])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      console.log("🔐 Attempting login for:", email)

      const response: AxiosResponse<AuthResponse> = await api.post("/api/auth/login", {
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)

      console.log("✅ Login successful:", userData.username)
    } catch (error: any) {
      console.error("❌ Login error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Ошибка входа")
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true)
      console.log("📝 Attempting registration for:", userData.username)

      const response: AxiosResponse<AuthResponse> = await api.post("/api/auth/register", userData)

      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)

      console.log("✅ Registration successful:", newUser.username)
    } catch (error: any) {
      console.error("❌ Registration error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Ошибка регистрации")
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    console.log("🚪 Logging out user:", user?.username)

    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Перенаправляем на главную страницу
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Экспортируем настроенный axios для использования в других компонентах
export { api }
