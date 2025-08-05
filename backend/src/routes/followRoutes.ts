import express from "express"
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} from "../controllers/followController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

router.post("/:targetUserId", authenticateToken, followUser)
router.delete("/:targetUserId", authenticateToken, unfollowUser)
router.get("/:userId/followers", getFollowers)
router.get("/:userId/following", getFollowing)
router.get("/:targetUserId/status", authenticateToken, checkFollowStatus)

export default router
