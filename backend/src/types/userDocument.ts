import type { Document } from "mongoose"

export interface UserDocument extends Document {
  _id: string
  username: string
  email: string
  password: string
  fullName: string
  bio?: string
  profilePicture?: string
  followers: string[]
  following: string[]
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface UserResponse {
  _id: string
  username: string
  email: string
  fullName: string
  bio?: string
  profilePicture?: string
  followers: string[]
  following: string[]
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  _id: string
  username: string
  fullName: string
  bio?: string
  profilePicture?: string
  followers: string[]
  following: string[]
  isVerified: boolean
  postsCount: number
  followersCount: number
  followingCount: number
}
