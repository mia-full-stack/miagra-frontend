import type { Request, Response } from "express";

import Conversation from 

export const getConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

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
      });

    const result = conversations.map((conv) => {
      const partner = conv.participants.find(
        (p: any) => p._id.toString() !== userId
      );

      return {
        user: partner,
        lastMessage: conv.lastMessage,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении разговоров" });
  }
};
