import type { Socket } from "socket.io"
import type { DefaultEventsMap } from "socket.io/dist/typed-events"

// Расширяем интерфейс Socket для ��обавления userId
export interface AuthenticatedSocket extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  userId?: string
}

// Типы для событий чата
export interface ChatEvents {
  joinChat: (data: { userId: string; targetUserId: string }) => void
  sendMessage: (data: { senderId: string; receiverId: string; messageText: string }) => void
  receiveMessage: (data: { senderId: string; messageText: string; createdAt: Date }) => void
  typing: (data: { receiverId: string; isTyping: boolean }) => void
  userTyping: (data: { userId: string; isTyping: boolean }) => void
}

// Интерфейс для подключенного пользователя
export interface ConnectedUser {
  userId: string
  socketId: string
  connectedAt: Date
}

// Тип для JWT payload
export interface JwtPayload {
  id: string
  iat?: number
  exp?: number
}
