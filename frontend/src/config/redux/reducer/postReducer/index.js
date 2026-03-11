import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  createPost,
  deletePost,
  likePost,
  commentPost,
  sharePost,
} from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder

      // ✅ GET ALL POSTS
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching Posts...";
      })

      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;

        // 🔥 SAFE HANDLING
        if (Array.isArray(action.payload)) {
          state.posts = action.payload;
        } else if (Array.isArray(action.payload.posts)) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [];
        }

        state.message = "Posts fetched successfully";
      })

      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Error fetching posts";
      })

      // ✅ CREATE POST
      .addCase(createPost.fulfilled, (state, action) => {
        if (action.payload?.post) {
          state.posts = [action.payload.post, ...state.posts];
        }
      })

      // ✅ DELETE POST
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
      })

      // ✅ LIKE POST
      .addCase(likePost.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) => {
          if (post._id !== action.payload.post_id) return post;
          const existingLikedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
          const likedByUserId = action.payload.likedByUserId;
          let nextLikedBy = existingLikedBy;
          if (likedByUserId) {
            const matched = (id) => String(id) === String(likedByUserId);
            if (action.payload.liked === false) {
              nextLikedBy = existingLikedBy.filter((id) => !matched(id));
            } else if (!existingLikedBy.some((id) => matched(id))) {
              nextLikedBy = [...existingLikedBy, likedByUserId];
            }
          }

          if (typeof action.payload.likes === "number") {
            return {
              ...post,
              likes: action.payload.likes,
              likedBy: nextLikedBy,
            };
          }
          return {
            ...post,
            likes: (post.likes || 0) + 1,
            likedBy: nextLikedBy,
          };
        });
      })

      // ✅ COMMENT POST (track count locally)
      .addCase(commentPost.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) => {
          if (post._id !== action.payload.post_id) return post;
          const existingComments = Array.isArray(post.comments) ? post.comments : [];
          return {
            ...post,
            comments: action.payload.comment
              ? [...existingComments, action.payload.comment]
              : existingComments,
          };
        });
      })

      // ✅ SHARE POST
      .addCase(sharePost.fulfilled, (state, action) => {
        if (action.payload?._id) {
          state.posts = [action.payload, ...state.posts];
        }
      });
  },
});

export default postSlice.reducer;
