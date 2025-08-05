import fs from "fs";
import Post from "../models/postModel";
import User from "../models/userModel";
import Comment from "../models/commentModel";

const processImages = (files?: Express.Multer.File[]) => {
  const images: any[] = [];
  if (files) {
    for (const file of files) {
      const buffer = fs.readFileSync(file.path);
      images.push({
        data: buffer.toString("base64"),
        contentType: file.mimetype,
        filename: file.originalname,
        size: file.size,
      });
      fs.unlinkSync(file.path);
    }
  }
  return images;
};

export const createPostService = async (
  userId: string,
  content: string,
  files?: Express.Multer.File[]
) => {
  if (!content?.trim()) throw new Error("Content is required");
  const images = processImages(files);
  const post = await Post.create({
    author: userId,
    content: content.trim(),
    images,
  });
  return post.populate("author", "username fullName profilePicture isVerified");
};

export const getPostsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const posts = await Post.find()
    .populate("author", "username fullName profilePicture isVerified")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "username fullName profilePicture isVerified",
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
  const total = await Post.countDocuments();
  const postsWithImages = posts.map((post) => {
    const obj = post.toObject();
    if (obj.images) {
      obj.images = obj.images.map((img: any) => ({
        ...img,
        url: `data:${img.contentType};base64,${img.data}`,
      }));
    }
    return obj;
  });
  return { posts: postsWithImages, total };
};

export const getPostByIdService = async (id: string) => {
  const post = await Post.findById(id)
    .populate("author", "username fullName profilePicture isVerified")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "username fullName profilePicture isVerified",
      },
    });
  if (!post) return null;
  const obj = post.toObject();
  if (obj.images) {
    obj.images = obj.images.map((img: any) => ({
      ...img,
      url: `data:${img.contentType};base64,${img.data}`,
    }));
  }
  return obj;
};

export const getUserPostsService = async (
  username: string,
  page: number,
  limit: number
) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");
  const skip = (page - 1) * limit;
  const posts = await Post.find({ author: user._id })
    .populate("author", "username fullName profilePicture isVerified")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "username fullName profilePicture isVerified",
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
  const total = await Post.countDocuments({ author: user._id });
  const postsWithImages = posts.map((post) => {
    const obj = post.toObject();
    if (obj.images) {
      obj.images = obj.images.map((img: any) => ({
        ...img,
        url: `data:${img.contentType};base64,${img.data}`,
      }));
    }
    return obj;
  });
  return { posts: postsWithImages, total };
};

export const toggleLikeService = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  const isLiked = post.likes.includes(userId);
  post.likes = isLiked
    ? post.likes.filter((id) => id !== userId)
    : [...post.likes, userId];
  await post.save();
  return {
    message: isLiked ? "Unliked" : "Liked",
    isLiked: !isLiked,
    likesCount: post.likes.length,
  };
};

export const deletePostService = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw { status: 404, message: "Post not found" };
  if (post.author.toString() !== userId)
    throw { status: 403, message: "Not your post" };
  await Comment.deleteMany({ post: postId });
  await post.deleteOne();
};

export const updatePostService = async (
  postId: string,
  userId: string,
  content: string,
  files?: Express.Multer.File[]
) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  if (post.author.toString() !== userId) throw new Error("Not your post");
  if (!content?.trim()) throw new Error("Content required");
  post.content = content.trim();
  if (files && files.length > 0) {
    post.images = processImages(files);
  }
  await post.save();
  return post.populate("author", "username fullName profilePicture isVerified");
};
