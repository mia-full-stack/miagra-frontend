// import type { Response } from "express"
// import Post from "../models/postModel"
// import User from "../models/userModel"
// import Comment from "../models/commentModel"
// import type { AuthenticatedRequest } from "../types/express"

// // Создание нового поста
// export const createPost = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { content, images } = req.body
//     const userId = req.user._id

//     console.log("📝 Creating post:", { content, images, userId })

//     if (!content || content.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Post content is required",
//       })
//     }

//     const post = await Post.create({
//       author: userId,
//       content: content.trim(),
//       images: images || [], // Убедимся что images это массив
//     })

//     // Популяция автора поста
//     await post.populate("author", "username fullName profilePicture isVerified")

//     console.log("✅ Post created successfully:", post._id)

//     res.status(201).json({
//       success: true,
//       message: "Post created successfully",
//       post,
//     })
//   } catch (error: any) {
//     console.error("❌ Create post error:", error)

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err: any) => err.message)
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: messages,
//       })
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server error during post creation",
//     })
//   }
// }

// // Получение всех постов (лента)
// export const getPosts = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const page = Number.parseInt(req.query.page as string) || 1
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const skip = (page - 1) * limit

//     console.log("📖 Fetching posts:", { page, limit, skip })

//     const posts = await Post.find()
//       .populate("author", "username fullName profilePicture isVerified")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "author",
//           select: "username fullName profilePicture isVerified",
//         },
//       })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip(skip)

//     const total = await Post.countDocuments()

//     console.log("✅ Posts fetched:", posts.length)

//     res.json({
//       success: true,
//       posts,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error: any) {
//     console.error("❌ Get posts error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// }

// // Получение поста по ID
// export const getPost = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { id } = req.params

//     const post = await Post.findById(id)
//       .populate("author", "username fullName profilePicture isVerified")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "author",
//           select: "username fullName profilePicture isVerified",
//         },
//       })

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       })
//     }

//     res.json({
//       success: true,
//       post,
//     })
//   } catch (error: any) {
//     console.error("❌ Get post error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// }

// // Получение постов пользователя
// export const getUserPosts = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { username } = req.params
//     const page = Number.parseInt(req.query.page as string) || 1
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const skip = (page - 1) * limit

//     // Находим пользователя по username
//     const user = await User.findOne({ username })

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     const posts = await Post.find({ author: user._id })
//       .populate("author", "username fullName profilePicture isVerified")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "author",
//           select: "username fullName profilePicture isVerified",
//         },
//       })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip(skip)

//     const total = await Post.countDocuments({ author: user._id })

//     res.json({
//       success: true,
//       posts,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error: any) {
//     console.error("❌ Get user posts error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// }

// // Лайк/дизлайк поста
// export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { id } = req.params
//     const userId = req.user._id

//     const post = await Post.findById(id)

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       })
//     }

//     const isLiked = post.likes.includes(userId)

//     if (isLiked) {
//       // Убираем лайк
//       post.likes = post.likes.filter((like) => like !== userId)
//     } else {
//       // Добавляем лайк
//       post.likes.push(userId)
//     }

//     await post.save()

//     res.json({
//       success: true,
//       message: isLiked ? "Post unliked" : "Post liked",
//       isLiked: !isLiked,
//       likesCount: post.likes.length,
//     })
//   } catch (error: any) {
//     console.error("❌ Toggle like error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// }

// // Удаление поста
// export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { id } = req.params
//     const userId = req.user._id

//     const post = await Post.findById(id)

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       })
//     }

//     // Проверяем, является ли пользователь автором поста
//     if (post.author !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only delete your own posts",
//       })
//     }

//     // Удаляем все комментарии к посту
//     await Comment.deleteMany({ post: id })

//     // Удаляем пост
//     await Post.findByIdAndDelete(id)

//     res.json({
//       success: true,
//       message: "Post deleted successfully",
//     })
//   } catch (error: any) {
//     console.error("❌ Delete post error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// }

// // Обновление поста
// export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { id } = req.params
//     const { content, images } = req.body
//     const userId = req.user._id

//     if (!content || content.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Post content is required",
//       })
//     }

//     const post = await Post.findById(id)

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       })
//     }

//     // Проверяем, является ли пользователь автором поста
//     if (post.author !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only edit your own posts",
//       })
//     }

//     // Обновляем пост
//     post.content = content.trim()
//     if (images !== undefined) {
//       post.images = images
//     }

//     await post.save()

//     // Популяция автора поста
//     await post.populate("author", "username fullName profilePicture isVerified")

//     res.json({
//       success: true,
//       message: "Post updated successfully",
//       post,
//     })
//   } catch (error: any) {
//     console.error("❌ Update post error:", error)

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err: any) => err.message)
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: messages,
//       })
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server error during post update",
//     })
//   }
// }
