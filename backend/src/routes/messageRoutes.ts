import express from "express"
import { getMessages, sendMessage, getConversations, createConversation } from "../controllers/messageController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

router.get("/conversations", authenticateToken, getConversations)
router.post("/conversations/:targetUserId", authenticateToken, createConversation)

router.get("/:targetUserId", authenticateToken, getMessages)
router.post("/:targetUserId", authenticateToken, sendMessage)

export default router
