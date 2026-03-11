import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../..";








export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      console.log("GET POSTS:", response.data);
      return response.data;   // no need fulfillWithValue
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createPost= createAsyncThunk(
        "post/createPost",
        async (userData, thunkAPI) => {
            const {file,body}=userData;
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    return thunkAPI.rejectWithValue("Please login again");
                }

                const formData = new FormData();
                formData.append('token', token);
                formData.append('body', body);
                if (file) {
                  formData.append('media', file);
                }
               
                
                const response = await clientServer.post("/post", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if(response.status===200){
                return thunkAPI.fulfillWithValue("Post Uploaded Successfully");
                }
                else{
                    return thunkAPI.rejectWithValue("Post creation failed");
                }
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response?.data?.message || error.message || "Post creation failed"
                );
            }
        }
     );

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !post_id) {
        return thunkAPI.rejectWithValue("Missing token or post id");
      }

      const response = await clientServer.post("/delete_post", {
        token,
        post_id,
      });

      if (response.status === 200) {
        return post_id;
      }

      return thunkAPI.rejectWithValue("Post deletion failed");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Post deletion failed"
      );
    }
  }
);

export const likePost = createAsyncThunk(
  "post/likePost",
  async (post_id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!post_id || !token) {
        return thunkAPI.rejectWithValue("Missing post id or token");
      }

      const response = await clientServer.post("/increment_post_like", {
        post_id,
        token,
      });

      if (response.status === 200) {
        return {
          post_id,
          likes: response.data?.likes,
          likedByUserId: response.data?.likedByUserId,
          liked: response.data?.liked,
        };
      }

      return thunkAPI.rejectWithValue("Like failed");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Like failed"
      );
    }
  }
);

export const commentPost = createAsyncThunk(
  "post/commentPost",
  async ({ post_id, commentBody }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !post_id || !commentBody?.trim()) {
        return thunkAPI.rejectWithValue("Missing token, post id or comment");
      }

      const response = await clientServer.post("/comment", {
        token,
        post_id,
        commentBody: commentBody.trim(),
      });

      if (response.status === 200) {
        return { post_id, comment: response.data?.comment };
      }

      return thunkAPI.rejectWithValue("Comment failed");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Comment failed"
      );
    }
  }
);

export const getCommentsByPost = createAsyncThunk(
  "post/getCommentsByPost",
  async (post_id, thunkAPI) => {
    try {
      if (!post_id) {
        return thunkAPI.rejectWithValue("Missing post id");
      }

      const response = await clientServer.get("/get_comments", {
        params: { post_id },
      });

      if (response.status === 200) {
        return { post_id, comments: response.data?.comments || [] };
      }

      return thunkAPI.rejectWithValue("Unable to fetch comments");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Unable to fetch comments"
      );
    }
  }
);

export const sharePost = createAsyncThunk(
  "post/sharePost",
  async (post_id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !post_id) {
        return thunkAPI.rejectWithValue("Missing token or post id");
      }

      const response = await clientServer.post("/share_post", {
        token,
        post_id,
      });

      if (response.status === 200) {
        return response.data?.post;
      }

      return thunkAPI.rejectWithValue("Unable to share post");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Unable to share post"
      );
    }
  }
);
