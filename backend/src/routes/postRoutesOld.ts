// import express from "express"
// import { createPost, getFeed, likePost, unlikePost, addComment, upload } from "../controllers/postController"
// import { authenticateToken } from "../middleware/auth"

// const router = express.Router()

// console.log("📝 Setting up post routes...")

// // POST /api/posts - создать пост (с загрузкой изображения)
// router.post("/", authenticateToken, upload.single("image"), createPost)

// // GET /api/posts/feed - получить ленту постов
// router.get("/feed", authenticateToken, getFeed)

// // POST /api/posts/:postId/like - лайкнуть пост
// router.post("/:postId/like", authenticateToken, likePost)

// // DELETE /api/posts/:postId/like - убрать лайк
// router.delete("/:postId/like", authenticateToken, unlikePost)

// // POST /api/posts/:postId/comments - добавить комментарий
// router.post("/:postId/comments", authenticateToken, addComment)

// console.log("✅ Post routes configured")

// export default router

