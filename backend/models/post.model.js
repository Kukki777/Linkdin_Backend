import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    body: {
      type: String,
      required: true,
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    media: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    },
    fileType: {
        type: String,
        default: ''
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    }
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
