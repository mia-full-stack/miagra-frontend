// import type { Document, Types } from "mongoose"
// import type { Socket } from "socket.io"
// import type { DefaultEventsMap } from "socket.io/dist/typed-events"

// // Базовые интерфейсы для пользователя
// export interface IUserBase {
//   username: string
//   email: string
//   password: string
//   fullName: string
//   profilePicture?: string
//   posts: Types.ObjectId[]
//   following: Types.ObjectId[]
//   followers: Types.ObjectId[]
//   createdAt?: Date
//   updatedAt?: Date
// }

// // Интерфейс для Mongoose документа
// export interface IUser extends IUserBase, Document {
//   _id: Types.ObjectId
// }

// // Тип для lean() запросов (простые объекты без методов Mongoose)
// export interface IUserLean {
//   _id: Types.ObjectId
//   username: string
//   email: string
//   password: string
//   fullName: string
//   profilePicture?: string
//   posts: Types.ObjectId[]
//   following: Types.ObjectId[]
//   followers: Types.ObjectId[]
//   createdAt: Date
//   updatedAt: Date
// }

// // Тип для ответа клиенту (без пароля)
// export interface UserResponse {
//   _id: Types.ObjectId | string
//   username: string
//   email: string
//   fullName: string
//   profilePicture?: string
//   posts?: Types.ObjectId[]
//   following?: Types.ObjectId[]
//   followers?: Types.ObjectId[]
//   createdAt?: Date
//   updatedAt?: Date
// }

// // Интерфейсы для постов
// export interface IPostBase {
//   author: Types.ObjectId
//   caption: string
//   image: string
//   likes: Types.ObjectId[]
//   comments: Types.ObjectId[]
//   createdAt?: Date
//   updatedAt?: Date
// }

// export interface IPost extends IPostBase, Document {
//   _id: Types.ObjectId
// }

// export interface IPostLean {
//   _id: Types.ObjectId
//   author: Types.ObjectId
//   caption: string
//   image: string
//   likes: Types.ObjectId[]
//   comments: Types.ObjectId[]
//   createdAt: Date
//   updatedAt: Date
// }

// // Интерфейсы для комментариев
// export interface ICommentBase {
//   author: Types.ObjectId
//   post: Types.ObjectId
//   text: string
//   createdAt?: Date
//   updatedAt?: Date
// }

// export interface IComment extends ICommentBase, Document {
//   _id: Types.ObjectId
// }

// export interface ICommentLean {
//   _id: Types.ObjectId
//   author: Types.ObjectId
//   post: Types.ObjectId
//   text: string
//   createdAt: Date
//   updatedAt: Date
// }

// // Интерфейсы для уведомлений
// export interface INotificationBase {
//   recipient: Types.ObjectId
//   sender: Types.ObjectId
//   type: "like" | "comment" | "follow"
//   post?: Types.ObjectId
//   message?: string
//   read: boolean
//   createdAt?: Date
//   updatedAt?: Date
// }

// export interface INotification extends INotificationBase, Document {
//   _id: Types.ObjectId
// }

// export interface INotificationLean {
//   _id: Types.ObjectId
//   recipient: Types.ObjectId
//   sender: Types.ObjectId
//   type: "like" | "comment" | "follow"
//   post?: Types.ObjectId
//   message?: string
//   read: boolean
//   createdAt: Date
//   updatedAt: Date
// }

// // Socket.IO типы
// export interface AuthenticatedSocket extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
//   userId?: string
// }

// export interface ChatEvents {
//   joinChat: (data: { userId: string; targetUserId: string }) => void
//   sendMessage: (data: { senderId: string; receiverId: string; messageText: string }) => void
//   receiveMessage: (data: { senderId: string; messageText: string; createdAt: Date }) => void
//   typing: (data: { receiverId: string; isTyping: boolean }) => void
//   userTyping: (data: { userId: string; isTyping: boolean }) => void
// }

// export interface ConnectedUser {
//   userId: string
//   socketId: string
//   connectedAt: Date
// }

// export interface JwtPayload {
//   id: string
//   iat?: number
//   exp?: number
// }

// // Расширяем Request для типизации middleware
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string
//       }
//       io?: any
//     }
//   }
// }
