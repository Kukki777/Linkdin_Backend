import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, createPost } from "../../action/postAction";

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
      });
  },
});

export default postSlice.reducer;