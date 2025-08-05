import mongoose, { type Document, Schema } from "mongoose"

export interface IComment extends Document {
  author: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  text: string
  likes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IComment>("Comment", commentSchema)
