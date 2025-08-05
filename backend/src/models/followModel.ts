import mongoose, { type Document, Schema } from "mongoose"

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId
  following: mongoose.Types.ObjectId
  createdAt: Date
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true })

export default mongoose.model<IFollow>("Follow", followSchema)
