import type { Request, Response } from "express"
import Message from "../models/messageModel"
import User from "../models/userModel"
import Notification from "../models/notificationModel"
import Conversation from "../models/conversationModel"

interface AuthRequest extends Request {
  user?: any
  io?: any
}

export const createConversation = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.params
  const userId = req.user.id

  if (userId === targetUserId) {
    return res.status(400).json({ error: "Нельзя создать разговор с собой" })
  }

  try {
    const existing = await Conversation.findOne({
      participants: { $all: [userId, targetUserId], $size: 2 },
    })

    if (existing) {
      return res.status(200).json(existing)
    }

    const conversation = new Conversation({
      participants: [userId, targetUserId],
    })

    await conversation.save()

    res.status(201).json(conversation)
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании разговора" })
  }
}


export const getMessages = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.params
  const userId = req.user.id

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: targetUserId },
        { sender: targetUserId, receiver: userId },
      ],
    })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .sort({ createdAt: 1 })

    // Mark as read
    await Message.updateMany(
      { sender: targetUserId, receiver: userId, isRead: false },
      { isRead: true },
    )

    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении сообщений" })
  }
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.params
  const { messageText } = req.body
  const userId = req.user.id

  try {
    const user = await User.findById(userId)
    const targetUser = await User.findById(targetUserId)

    if (!user || !targetUser) {
      return res.status(404).json({ error: "Пользователь не найден" })
    }

    const message = new Message({
      sender: userId,
      receiver: targetUserId,
      messageText,
    })

    await message.save()
    await message.populate("sender", "username profilePicture")

    // ✅ Обновить или создать разговор
    let conversation = await Conversation.findOne({
      participants: {
        $size: 2,
        $all: [userId, targetUserId],
      },
    })

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, targetUserId],
      })
    }

    conversation.lastMessage = message._id
    await conversation.save()

    // 🔔 Уведомление
    const notification = new Notification({
      recipient: targetUserId,
      sender: userId,
      type: "message",
      message: messageText.length > 50 ? messageText.slice(0, 50) + "..." : messageText,
    })
    await notification.save()

    // 🔌 WebSocket
    req.io.to(targetUserId.toString()).emit("receiveMessage", {
      _id: message._id,
      sender: message.sender,
      receiver: targetUserId,
      messageText,
      createdAt: message.createdAt,
      isRead: false,
    })

    req.io.to(targetUserId.toString()).emit("newNotification", notification)

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ error: "Ошибка при отправке сообщения" })
  }
}

export const getConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id

  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "username fullName profilePicture")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username profilePicture",
        },
      })

    const result = conversations.map((conv) => {
      const partner = conv.participants.find((p: any) => p._id.toString() !== userId)

      return {
        user: partner,
        lastMessage: conv.lastMessage,
      }
    })

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении разговоров" })
  }
}










// import type { Request, Response } from "express"
// import Message from "../models/messageModel"
// import User from "../models/userModel"
// import Notification from "../models/notificationModel"
// // import Conversation from "../models/conversationModel"


// interface AuthRequest extends Request {
//   user?: any
//   io?: any
// }

// export const getMessages = async (req: AuthRequest, res: Response) => {
//   const { targetUserId } = req.params
//   const userId = req.user.id

//   try {
//     const messages = await Message.find({
//       $or: [
//         { sender: userId, receiver: targetUserId },
//         { sender: targetUserId, receiver: userId },
//       ],
//     })
//       .populate("sender", "username profilePicture")
//       .populate("receiver", "username profilePicture")
//       .sort({ createdAt: 1 })

//     // Mark messages as read
//     await Message.updateMany({ sender: targetUserId, receiver: userId, isRead: false }, { isRead: true })

//     res.status(200).json(messages)
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка при получении сообщений" })
//   }
// }

// export const sendMessage = async (req: AuthRequest, res: Response) => {
//   const { targetUserId } = req.params
//   const { messageText } = req.body
//   const userId = req.user.id

//   try {
//     // Проверка пользователей
//     const user = await User.findById(userId)
//     const targetUser = await User.findById(targetUserId)

//     if (!user || !targetUser) {
//       return res.status(404).json({ error: "Пользователь не найден" })
//     }

//     // Сохранение сообщения в базе данных
//     const message = new Message({
//       sender: userId,
//       receiver: targetUserId,
//       messageText,
//     })

//     await message.save()
//     await message.populate("sender", "username profilePicture")

//     // Создание уведомления
//     const notification = new Notification({
//       recipient: targetUserId,
//       sender: userId,
//       type: "message",
//       message: messageText.substring(0, 50) + (messageText.length > 50 ? "..." : ""),
//     })
//     await notification.save()

//     // Отправляем сообщение через Socket.io
//     req.io.to(targetUserId.toString()).emit("receiveMessage", {
//       _id: message._id,
//       sender: message.sender,
//       receiver: targetUserId,
//       messageText,
//       createdAt: message.createdAt,
//       isRead: false,
//     })


//     // Отправляем уведомление
//     req.io.to(targetUserId.toString()).emit("newNotification", notification)

//     res.status(201).json(message)
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка при отправке сообщения" })
//   }
// }

// export const getConversations = async (req: AuthRequest, res: Response) => {
//   const userId = req.user.id

//   try {
//     const conversations = await Message.aggregate([
//       {
//         $match: {
//           $or: [{ sender: userId }, { receiver: userId }],
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $group: {
//           _id: {
//             $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
//           },
//           lastMessage: { $first: "$$ROOT" },
//           unreadCount: {
//             $sum: {
//               $cond: [{ $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] }, 1, 0],
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $unwind: "$user",
//       },
//       {
//         $project: {
//           user: {
//             _id: 1,
//             username: 1,
//             fullName: 1,
//             profilePicture: 1,
//           },
//           lastMessage: 1,
//           unreadCount: 1,
//         },
//       },
//       {
//         $sort: { "lastMessage.createdAt": -1 },
//       },
//     ])

//     res.status(200).json(conversations)
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка при получении разговоров" })
//   }
// }
