import type { Request, Response } from "express"
import Notification from "../models/notificationModel"

export const getNotifications = async (req: Request, res: Response) => {
  try {
    console.log("📋 Fetching notifications for user:", req.user?.username)

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username fullName profilePicture")
      .populate("post", "image")
      .sort({ createdAt: -1 })
      .limit(50)

    console.log(`✅ Found ${notifications.length} notifications`)
    res.json(notifications)
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { isRead: true },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    console.log("✅ Notification marked as read:", notificationId)
    res.json(notification)
  } catch (error) {
    console.error("❌ Error marking notification as read:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    await Notification.updateMany({ recipient: req.user._id }, { isRead: true })

    console.log("✅ All notifications marked as read for user:", req.user.username)
    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error)
    res.status(500).json({ message: "Server error" })
  }
}
