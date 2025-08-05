import express from "express"
import { Router } from "express"
import {
  createPost,
  getPosts,
  getPost,
  getUserPosts,
  toggleLike,
  deletePost,
  updatePost,
} from "../controllers/postController"

import { authenticateToken } from "../middleware/auth"
import { protect } from "../middleware/auth"
import upload from "../middleware/upload"

const postRouter : Router = Router();

// Все маршруты требуют аутентификации
postRouter.use(authenticateToken)

// Создание поста с загрузкой изображений (до 4 файлов)
postRouter.post("/", upload.array("images", 4), createPost)

// Получение всех постов (лента)
postRouter.get("/", getPosts)

// Получение поста по ID
postRouter.get("/:id", getPost)

// Получение постов пользователя
postRouter.get("/user/:username", getUserPosts)

// Лайк/дизлайк поста
postRouter.post("/:id/like", toggleLike)

// Обновление поста
postRouter.put("/:id", upload.array("images", 4), updatePost)

// Удаление поста
postRouter.delete("/:id", deletePost)

export default postRouter
