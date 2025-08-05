import type { Request, Response } from "express"
import Follow from "../models/followModel"
import User from "../models/userModel"
import Notification from "../models/notificationModel"

interface AuthRequest extends Request {
  user?: any
  io?: any
}

export const followUser = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.params
  const userId = req.user.id

  try {
    if (userId === targetUserId) {
      return res.status(400).json({ error: "Нельзя подписаться на себя" })
    }

    // Проверяем, существует ли уже подписка
    const existingFollow = await Follow.findOne({
      follower: userId,
      following: targetUserId,
    })

    if (existingFollow) {
      return res.status(400).json({ error: "Вы уже подписаны на этого пользователя" })
    }

    // Создаем подписку
    const follow = new Follow({
      follower: userId,
      following: targetUserId,
    })

    await follow.save()

    // Обновляем счетчики пользователей
    await User.findByIdAndUpdate(userId, {
      $push: { following: targetUserId },
    })

    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: userId },
    })

    // Создаем уведомление
    const notification = new Notification({
      recipient: targetUserId,
      sender: userId,
      type: "follow",
    })

    await notification.save()
    await notification.populate("sender", "username profilePicture")

    // Отправляем уведомление через Socket.io
    req.io.to(targetUserId.toString()).emit("newNotification", notification)

    res.status(201).json({ message: "Подписка успешно создана" })
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании подписки" })
  }
}

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.params
  const userId = req.user.id

  try {
    // Удаляем подписку
    const follow = await Follow.findOneAndDelete({
      follower: userId,
      following: targetUserId,
    })

    if (!follow) {
      return res.status(404).json({ error: "Подписка не найдена" })
    }

    // Обновляем счетчики пользователей
    await User.findByIdAndUpdate(userId, {
      $pull: { following: targetUserId },
    })

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: userId },
    })

    res.status(200).json({ message: "Отписка успешно выполнена" })
  } catch (error) {
    res.status(500).json({ error: "Ошибка при отписке" })
  }
}

export const getFollowers = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    const followers = await Follow.find({ following: userId })
      .populate("follower", "username fullName profilePicture")
      .sort({ createdAt: -1 })

    res.status(200).json(followers.map((f) => f.follower))
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении подписчиков" })
  }
}

export const getFollowing = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    const following = await Follow.find({ follower: userId })
      .populate("following", "username fullName profilePicture")
      .sort({ createdAt: -1 })

    res.status(200).json(following.map((f) => f.following))
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении подписок" })
  }
}

export const checkFollowStatus = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.params
  const userId = req.user.id

  try {
    const follow = await Follow.findOne({
      follower: userId,
      following: targetUserId,
    })

    res.status(200).json({ isFollowing: !!follow })
  } catch (error) {
    res.status(500).json({ error: "Ошибка при проверке статуса подписки" })
  }
}
