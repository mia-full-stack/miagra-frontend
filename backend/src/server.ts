// ВАЖНО: dotenv.config() должен быть ПЕРВЫМ!
import dotenv from "dotenv"
dotenv.config()

import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import mongoose from "mongoose"
import path from "path"
import helmet from "helmet"
import { socketHandler } from "./socket/socketHandler"
import {errorHandler} from "./middleware/errorHandler"

// Routes
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"
import postRoutes from "./routes/postRoutes"
import messageRoutes from "./routes/messageRoutes"
import followRoutes from "./routes/followRoutes"
import notificationRoutes from "./routes/notificationRoutes"


const app = express()
const server = createServer(app)

// Проверяем переменные окружения сразу
console.log("🔍 Checking environment variables...")
console.log("PORT:", process.env.PORT || "5000")
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Not set")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set")
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Not set")
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Not set")
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Not set")

// Разрешенные origins для CORS
const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.FRONTEND_URL || "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin))

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
  serveClient: false,
  connectTimeout: 45000,
})

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, мобильные приложения)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.log(`❌ CORS blocked origin: ${origin}`)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Статические файлы для загруженных изображений
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Make io available in routes
app.use((req: any, res, next) => {
  req.io = io
  next()
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

  res.json({
    status: "OK",
    message: "Miagra API Server is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    allowedOrigins: allowedOrigins,
    cloudinary: cloudinaryConfigured ? "✅ Configured" : "❌ Not configured",
    mongodb: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Not set",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Not set",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Not set",
    },
  })
})

// Routes - ВАЖНО: правильный порядок подключения
console.log("🔗 Setting up API routes...")

app.use("/api/auth", authRoutes)
console.log("✅ Auth routes: /api/auth")

app.use("/api/users", userRoutes)
console.log("✅ User routes: /api/users")

app.use("/api/posts", postRoutes)
console.log("✅ Post routes: /api/posts")

app.use("/api/messages", messageRoutes)
console.log("✅ Message routes: /api/messages")

app.use("/api/follow", followRoutes)
console.log("✅ Follow routes: /api/follow")

app.use("/api/notifications", notificationRoutes)
console.log("✅ Notification routes: /api/notifications")

app.use(errorHandler)

// app.use("/api/profile", )

console.log("✅ All API routes configured")

// Socket handling
socketHandler(io)

// Проверяем обязательные переменные окружения
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "))
  console.error("Please check your .env file")
  process.exit(1)
}

// Проверяем Cloudinary
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (!cloudinaryConfigured) {
  console.log("")
  console.log("⚠️  ❌ CLOUDINARY NOT CONFIGURED ❌")
  console.log("   Image uploads will use local storage!")
  console.log("   Please set these environment variables in backend/.env:")
  console.log("   - CLOUDINARY_CLOUD_NAME")
  console.log("   - CLOUDINARY_API_KEY")
  console.log("   - CLOUDINARY_API_SECRET")
  console.log("")
  console.log("   Get them from: https://cloudinary.com/console")
  console.log("   Or run: chmod +x setup-cloudinary.sh && ./setup-cloudinary.sh")
  console.log("")
}

// MongoDB connection с улучшенной обработкой ошибок
const connectToMongoDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")
    console.log("📍 MongoDB URI:", process.env.MONGODB_URI?.replace(/\/\/.*@/, "//***:***@") || "Not set")

    await mongoose.connect(process.env.MONGODB_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log("✅ Connected to MongoDB")
    console.log(`📊 Database: ${process.env.MONGODB_URI?.split("/").pop()}`)
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("")
      console.log("🔧 MONGODB NOT RUNNING!")
      console.log("   Please start MongoDB:")
      console.log("   - Run: chmod +x start-mongodb.sh && ./start-mongodb.sh")
      console.log("   - Or manually: mongod")
      console.log("   - Or use MongoDB Atlas: https://www.mongodb.com/atlas")
      console.log("")
    }

    process.exit(1)
  }
}

// Обработка событий подключения к MongoDB
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected")
})

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("🟡 MongoDB disconnected")
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Сначала подключаемся к MongoDB
    await connectToMongoDB()

    // Затем запускаем сервер
    server.listen(PORT, () => {
      console.log("")
      console.log(`🚀 Miagra API Server running on port ${PORT}`)
      console.log(`📱 Allowed origins: ${allowedOrigins.join(", ")}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`)
      console.log(`📝 Posts API: http://localhost:${PORT}/api/posts`)
      console.log(`👤 Users API: http://localhost:${PORT}/api/users`)
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
      console.log(`☁️  Cloudinary: ${cloudinaryConfigured ? "✅ Ready" : "❌ Not configured"}`)
      console.log(`🍃 MongoDB: ✅ Connected`)
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`)
      console.log(`📊 Database: ${process.env.MONGODB_URI?.split("/").pop()}`)
      console.log("")

      if (!cloudinaryConfigured) {
        console.log("🔧 TO FIX CLOUDINARY:")
        console.log("   1. Go to https://cloudinary.com")
        console.log("   2. Create free account")
        console.log("   3. Copy Cloud Name, API Key, API Secret")
        console.log("   4. Update backend/.env file")
        console.log("   5. Restart server")
        console.log("")
      }
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}
app.use(helmet()) // Защита заголовков HTTP

// Запускаем сервер
startServer()

export default app
