// import mongoose, { Schema } from "mongoose"

// export interface PostDocument extends mongoose.Document {
//   _id: string
//   author: string
//   content: string
//   images: {
//     data: string // Base64 данные изображения
//     contentType: string // MIME тип (image/jpeg, image/png, etc.)
//     filename: string // Оригинальное имя файла
//     size: number // Размер файла в байтах
//   }[]
//   likes: string[]
//   comments: string[]
//   createdAt: Date
//   updatedAt: Date
// }

// const postSchema = new Schema<PostDocument>(
//   {
//     author: {
//       type: String,
//       ref: "User",
//       required: [true, "Author is required"],
//     },
//     content: {
//       type: String,
//       required: [true, "Content is required"],
//       maxlength: [2200, "Post content cannot exceed 2200 characters"],
//     },
//     images: [
//       {
//         data: {
//           type: String,
//           required: true,
//         },
//         contentType: {
//           type: String,
//           required: true,
//         },
//         filename: {
//           type: String,
//           required: true,
//         },
//         size: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     likes: [
//       {
//         type: String,
//         ref: "User",
//       },
//     ],
//     comments: [
//       {
//         type: String,
//         ref: "Comment",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   },
// )

// const Post = mongoose.model<PostDocument>("Post", postSchema)
// export default Post


import mongoose, { Schema, type Document } from "mongoose"

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  content: string
  images: Array<{
    data: string
    contentType: string
    filename: string
    size: number
  }>
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [2200, "Post content cannot exceed 2200 characters"],
    },
    images: [
      {
        data: {
          type: String,
          required: true,
        },
        contentType: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Индексы для оптимизации запросов
PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ createdAt: -1 })

export default mongoose.model<IPost>("Post", PostSchema)
