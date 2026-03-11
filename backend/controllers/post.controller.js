import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

import bcrypt from "bcrypt";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Controller is active" });
};

export const createPost = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("Incoming token:", req.body.token);

  try {
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });

    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body || "",
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();

    await post.populate("userId");

    return res.json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllPost = async (req, res) => {
  console.log("DB NAME:", Post.db.name);
console.log("POST COUNT:", await Post.countDocuments());
  try {
    const posts = await Post.find()
      .populate("userId", "name username email profilePicture createdAt")
      .populate({
        path: "sharedPostId",
        populate: {
          path: "userId",
          select: "name username email profilePicture createdAt",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostsByUsername = async (req, res) => {
  const username = req.query?.username || req.params?.username;
  try {
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }

    const user = await User.findOne({ username }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ userId: user._id })
      .populate("userId", "name username email profilePicture createdAt")
      .populate({
        path: "sharedPostId",
        populate: {
          path: "userId",
          select: "name username email profilePicture createdAt",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching posts by username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sharePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const originalPost = await Post.findById(post_id).select("_id");
    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const repost = new Post({
      userId: user._id,
      body: "Shared a post",
      media: "",
      fileType: "",
      isShared: true,
      sharedPostId: originalPost._id,
    });

    await repost.save();
    await repost.populate("userId", "name username email profilePicture createdAt");
    await repost.populate({
      path: "sharedPostId",
      populate: {
        path: "userId",
        select: "name username email profilePicture createdAt",
      },
    });

    return res.json({ message: "Post shared successfully", post: repost });
  } catch (error) {
    console.error("Error in share post controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (user._id.toString() !== post.userId.toString()) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    await Post.deleteOne({ _id: post_id });
    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: post_id }).select("_id");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = new Comment({
      postId: post_id,
      userId: user._id,
      body: commentBody,
    });
    await newComment.save();
    await newComment.populate("userId", "name username profilePicture");
    return res.json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get_comment_by_post = async (req, res) => {
  const post_id = req.body?.post_id || req.query?.post_id;
  try {
    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "name username profilePicture"
    );
    return res.json({ comments });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (!comment.userId || user._id.toString() !== comment.userId.toString()) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    await Comment.deleteOne({ _id: comment_id });
    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const increment_likes = async (req, res) => {
  const post_id = req.body?.post_id || req.query?.post_id;
  const token = req.body?.token || req.query?.token;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = Array.isArray(post.likedBy)
      ? post.likedBy.some((id) => id.toString() === user._id.toString())
      : false;
    if (alreadyLiked) {
      post.likedBy = (post.likedBy || []).filter(
        (id) => id.toString() !== user._id.toString()
      );
      post.likes = Math.max((post.likes || 0) - 1, 0);
      await post.save();
      return res.json({
        message: "Like removed successfully",
        likes: post.likes,
        likedByUserId: user._id.toString(),
        liked: false,
      });
    }

    post.likedBy = [...(post.likedBy || []), user._id];
    post.likes = post.likes + 1;
    await post.save();
    return res.json({
      message: "Likes incremented successfully",
      likes: post.likes,
      likedByUserId: user._id.toString(),
      liked: true,
    });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
