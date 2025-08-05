// import mongoose, { type Document, Schema } from "mongoose"

// export interface IPost extends Document {
//   author: mongoose.Types.ObjectId
//   caption: string
//   image: string
//   likes: mongoose.Types.ObjectId[]
//   comments: mongoose.Types.ObjectId[]
//   createdAt: Date
//   updatedAt: Date
// }

// const postSchema = new Schema<IPost>(
//   {
//     author: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     caption: {
//       type: String,
//       maxlength: 2200,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     likes: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     comments: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Comment",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   },
// )

// export default mongoose.model<IPost>("Post", postSchema)
