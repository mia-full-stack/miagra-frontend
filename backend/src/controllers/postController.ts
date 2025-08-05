import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as postService from '../services/postService';

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await postService.createPostService(req.user._id, req.body.content, req.files);
    res.status(201).json({ success: true, message: 'Post created', post });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { posts, total } = await postService.getPostsService(page, limit);
    res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await postService.getPostByIdService(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { posts, total } = await postService.getUserPostsService(req.params.username, page, limit);
    res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await postService.toggleLikeService(req.params.id, req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await postService.deletePostService(req.params.id, req.user._id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedPost = await postService.updatePostService(req.params.id, req.user._id, req.body.content, req.files);
    res.json({ success: true, message: 'Post updated', post: updatedPost });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
