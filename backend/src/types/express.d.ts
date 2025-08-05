import type { Request } from "express"
import type { Socket } from "socket.io"

import type { IUser } from "../models/userModel"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      io?: any
    }
  }
}


export interface IUser {
  _id: string
  username: string
  email: string
  fullName: string
  bio?: string
  profilePicture?: string
  avatar?: string
  followers: string[]
  following: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AuthenticatedRequest extends Request {
  user: IUser
}

export interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: IUser
}

export interface IUserPayload {
  _id: string
}

export interface AuthenticatedRequest extends Request {
  user: UserDocument
}