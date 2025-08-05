import { Router } from "express"
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserFollowing,
  getUserPosts,
} from "../controllers/userController"
import { authenticateToken } from "../middleware/auth"
import multer from "multer"

const upload = multer({ dest: "uploads/" })
const router = Router()


// Public routes
router.get("/profile/:username", authenticateToken, getUserProfile)
router.get("/posts/:username", authenticateToken, getUserPosts)

// Protected routes
router.put("/profile", authenticateToken, upload.single("profilePicture"), updateUserProfile)
router.get("/search", authenticateToken, searchUsers)
router.post("/follow/:userId", authenticateToken, followUser)
router.delete("/follow/:userId", authenticateToken, unfollowUser)
router.get("/followers/:userId", authenticateToken, getFollowers)
router.get("/following/:userId", authenticateToken, getFollowing)
router.get("/following", authenticateToken, getUserFollowing)

export default router



// import { Router } from "express"
// import {
//   getCurrentUser,
//   getUserProfile,
//   searchUsers,
//   updateUserProfile,
//   followUser,
//   unfollowUser,
//   getFollowers,
//   getFollowing,
// } from "../controllers/userController"
// import { authenticateToken } from "../middleware/auth"

// const router = Router()

// // Все маршруты требуют аутентификации
// router.use(authenticateToken)

// // Маршруты пользователей
// router.get("/me", getCurrentUser)

// // Поиск пользователей
// router.get("/search", searchUsers)

// // Профиль пользователя
// router.get("/profile/:username", getUserProfile)

// // Обновление профиля
// router.put("/profile", updateUserProfile)

// // Подписки
// router.post("/:userId/follow", followUser)
// router.delete("/:userId/follow", unfollowUser)

// // Получение подписчиков и подписок
// router.get("/:userId/followers", getFollowers)
// router.get("/:userId/following", getFollowing)

// export default router
