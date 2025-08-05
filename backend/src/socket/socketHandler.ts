import type { Server, Socket } from "socket.io"
import jwt from "jsonwebtoken"

// Расширяем интерфейс Socket для добавления userId
interface AuthenticatedSocket extends Socket {
  userId: string
}

interface SocketUser {
  userId: string
  socketId: string
}

const connectedUsers: Map<string, string> = new Map()

export const socketHandler = (io: Server) => {
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      ;(socket as any).userId = decoded.id
      next()
    } catch (err) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket: Socket) => {
    // Приводим socket к нашему типу внутри обработчика
    const authSocket = socket as AuthenticatedSocket

    console.log(`✅ User ${authSocket.userId} connected with socket ${authSocket.id}`)

    // Сохраняем соединение пользователя
    connectedUsers.set(authSocket.userId, authSocket.id)

    // Присоединяем пользователя к его личной комнате
    authSocket.join(authSocket.userId)

    // Обработка присоединения к чату
    authSocket.on("joinChat", (data: { userId: string; targetUserId: string }) => {
      const chatRoom = [data.userId, data.targetUserId].sort().join("-")
      authSocket.join(chatRoom)
      console.log(`💬 User ${data.userId} joined chat room: ${chatRoom}`)
    })

    // Обработка отправки сообщения
    authSocket.on(
      "sendMessage",
      (data: {
        senderId: string
        receiverId: string
        messageText: string
      }) => {
        const chatRoom = [data.senderId, data.receiverId].sort().join("-")

        // Отправляем сообщение в комнату чата
        authSocket.to(chatRoom).emit("receiveMessage", {
          senderId: data.senderId,
          messageText: data.messageText,
          createdAt: new Date(),
        })
      },
    )

    // Обработка набора текста
    authSocket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
      const receiverSocketId = connectedUsers.get(data.receiverId)
      if (receiverSocketId) {
        authSocket.to(receiverSocketId).emit("userTyping", {
          userId: authSocket.userId,
          isTyping: data.isTyping,
        })
      }
    })

    // Обработка отключения
    authSocket.on("disconnect", (reason: string) => {
      console.log(`❌ User ${authSocket.userId} disconnected: ${reason}`)
      connectedUsers.delete(authSocket.userId)
    })

    // Обработка ошибок
    authSocket.on("error", (error: Error) => {
      console.log(`🔥 Socket error for user ${authSocket.userId}:`, error.message)
    })
  })

  // Обработка ошибок на уровне сервера
  io.on("error", (error: Error) => {
    console.log("🔥 Socket.io server error:", error.message)
  })
}
