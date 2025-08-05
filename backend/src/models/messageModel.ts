import mongoose, { type Document, Schema } from "mongoose"

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId
  receiver: mongoose.Types.ObjectId
  messageText: string
  isRead: boolean
  createdAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageText: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IMessage>("Message", messageSchema)
