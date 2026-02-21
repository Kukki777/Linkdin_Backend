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
      .sort({ createdAt: -1 });

    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
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
    const comments = await Comment.find({ postId: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = new Comment({
      postId: post_id,
      userId: user._id,
      comment: commentBody,
    });
    await newComment.save();
    return res.json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get_comment_by_post = async (req, res) => {
  const { post_id } = req.body;
  try {
    const comments = await Comment.find({ _id: post_id });
    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments found" });
    }
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
  const { post_id } = req.body;
  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likes = post.likes + 1;
    await post.save();
    return res.json({ message: "Likes incremented successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
