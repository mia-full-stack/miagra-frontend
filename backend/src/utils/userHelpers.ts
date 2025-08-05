// import type { IUser, UserResponse, IUserLean } from "../types/index"
// import type { Document } from "mongoose"

// // Безопасное создание ответа пользователя из Mongoose документа
// export const createUserResponse = (user: IUser): UserResponse => {
//   return {
//     _id: user._id,
//     username: user.username,
//     email: user.email,
//     fullName: user.fullName,
//     profilePicture: user.profilePicture,
//     posts: user.posts,
//     following: user.following,
//     followers: user.followers,
//     createdAt: user.createdAt,
//     updatedAt: user.updatedAt,
//   }
// }

// // Создание ответа из lean объекта
// export const createUserResponseFromLean = (user: IUserLean): UserResponse => {
//   const { password, ...userWithoutPassword } = user
//   return userWithoutPassword
// }

// // Проверка, является ли объект Mongoose документом
// export const isMongooseDocument = (obj: any): obj is Document => {
//   return obj && typeof obj.toObject === "function"
// }

// // Универсальная функция для создания ответа
// export const safeCreateUserResponse = (user: IUser | IUserLean | any): UserResponse => {
//   if (isMongooseDocument(user)) {
//     // Это Mongoose документ
//     return createUserResponse(user as IUser)
//   } else {
//     // Это обычный объект (lean)
//     const { password, __v, ...userWithoutPassword } = user
//     return userWithoutPassword as UserResponse
//   }
// }

// // Функция для удаления чувствительных данных из пользователя
// export const sanitizeUser = (user: any): UserResponse => {
//   if (!user) {
//     throw new Error("User object is required")
//   }

//   const { password, __v, ...sanitizedUser } = user
//   return sanitizedUser as UserResponse
// }

// // Функция для создания публичного профиля пользователя (ограниченная информация)
// export const createPublicUserProfile = (user: IUser | IUserLean): Partial<UserResponse> => {
//   return {
//     _id: user._id,
//     username: user.username,
//     fullName: user.fullName,
//     profilePicture: user.profilePicture,
//   }
// }
