import type { Request, Response } from "express"
import User from "../models/userModel"
import Follow from "../models/followModel"
import type { AuthenticatedRequest } from "../types/express"
import bcrypt from "bcryptjs"

// Получение профиля пользователя по username
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params
    const currentUserId = req.user._id

    console.log(`🔍 Getting profile for username: ${username}`)

    const user = await User.findOne({ username }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Проверяем, подписан ли текущий пользователь на этого пользователя
    const isFollowing = await Follow.findOne({
      follower: currentUserId,
      following: user._id,
    })

    // Получаем статистику
    const followersCount = await Follow.countDocuments({ following: user._id })
    const followingCount = await Follow.countDocuments({ follower: user._id })

    const userProfile = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      followersCount,
      followingCount,
      postsCount: 0, // TODO: добавить подсчет постов
      isFollowing: !!isFollowing,
      isOwnProfile: user._id.toString() === currentUserId.toString(),
    }

    console.log(`✅ Profile found:`, userProfile)

    res.json(userProfile)
  } catch (error: any) {
    console.error("Get user profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Обновление профиля пользователя
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id
    const { fullName, bio, website, isPrivate } = req.body

    console.log(`📝 Updating profile for user: ${userId}`)

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        website,
        isPrivate,
      },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log(`✅ Profile updated successfully`)

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("Update profile error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Поиск пользователей
export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q } = req.query
    const currentUserId = req.user._id

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      })
    }

    console.log(`🔍 Searching users for: "${q}"`)

    const searchRegex = new RegExp(q, "i")

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Исключаем текущего пользователя
        {
          $or: [{ username: searchRegex }, { fullName: searchRegex }],
        },
      ],
    })
      .select("username fullName profilePicture")
      .limit(20)

    console.log(`✅ Found ${users.length} users`)

    res.json(users)
  } catch (error: any) {
    console.error("Search users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Получение списка пользователей (для админа или общего списка)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const users = await User.find().select("-password").limit(limit).skip(skip).sort({ createdAt: -1 })

    const total = await User.countDocuments()

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Получение списка подписок
export const getFollowing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id

    console.log(`📋 Getting following list for user: ${userId}`)

    const following = await Follow.find({ follower: userId }).populate("following", "username fullName profilePicture")

    const followingUsers = following.map((follow) => follow.following)

    console.log(`✅ Found ${followingUsers.length} following users`)

    res.json(followingUsers)
  } catch (error: any) {
    console.error("Get following error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Получение списка подписчиков
export const getFollowers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id

    console.log(`📋 Getting followers list for user: ${userId}`)

    const followers = await Follow.find({ following: userId }).populate("follower", "username fullName profilePicture")

    const followerUsers = followers.map((follow) => follow.follower)

    console.log(`✅ Found ${followerUsers.length} followers`)

    res.json(followerUsers)
  } catch (error: any) {
    console.error("Get followers error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Подписка на пользователя
export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      })
    }

    console.log(`👤 User ${currentUserId} trying to follow ${userId}`)

    // Проверяем, существует ли пользователь
    const userToFollow = await User.findById(userId)
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Проверяем, не подписан ли уже
    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userId,
    })

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      })
    }

    // Создаем подписку
    await Follow.create({
      follower: currentUserId,
      following: userId,
    })

    console.log(`✅ Successfully followed user ${userId}`)

    res.json({
      success: true,
      message: "Successfully followed user",
    })
  } catch (error: any) {
    console.error("Follow user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Отписка от пользователя
export const unfollowUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id

    console.log(`👤 User ${currentUserId} trying to unfollow ${userId}`)

    const deletedFollow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userId,
    })

    if (!deletedFollow) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      })
    }

    console.log(`✅ Successfully unfollowed user ${userId}`)

    res.json({
      success: true,
      message: "Successfully unfollowed user",
    })
  } catch (error: any) {
    console.error("Unfollow user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Изменение пароля
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    console.log(`🔐 Changing password for user: ${userId}`)

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Хешируем новый пароль
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Обновляем пароль
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

    console.log(`✅ Password changed successfully`)

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error: any) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
