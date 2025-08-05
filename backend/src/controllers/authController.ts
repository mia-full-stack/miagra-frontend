import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/userModel"
import type { AuthenticatedRequest } from "../types/express"

// Интерфейс для JWT payload
interface JWTPayload {
  userId: string
  iat?: number
  exp?: number
}

// Генерация JWT токена
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined")
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body

    // Валидация входных данных
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    console.log(`📝 Registration attempt for: ${username} (${email})`)

    // Проверка на существование пользователя
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username"
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      })
    }

    // Хеширование пароля
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Создание пользователя
    const user = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
    })

    // Генерация токена
    const token = generateToken(user._id.toString())

    // Подготовка данных пользователя (без пароля)
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
    }

    console.log(`✅ User registered successfully: ${user.username}`)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userData,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      })
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
}

// Вход пользователя
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    console.log(`🔐 Login attempt for: ${email}`)

    // Поиск пользователя
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Генерация токена
    const token = generateToken(user._id.toString())

    // Подготовка данных пользователя (без пароля)
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
    }

    console.log(`✅ User logged in successfully: ${user.username}`)

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    })
  } catch (error: any) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
}

// Верификация токена
export const verifyToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Пользователь уже добавлен в req через middleware protect
    const user = req.user

    console.log(`✅ Token verified for user: ${user.username}`)

    res.json({
      success: true,
      message: "Token is valid",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        website: user.website,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    console.error("Token verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    })
  }
}

// Выход пользователя (опционально)
export const logout = async (req: Request, res: Response) => {
  try {
    // В JWT токенах нет серверного состояния для очистки
    // Клиент должен удалить токен из localStorage
    console.log(`🚪 Logout request received`)

    res.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error: any) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    })
  }
}

// Получение текущего пользователя
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        website: user.website,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    console.error("Get current user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
