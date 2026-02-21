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
                const formData = new FormData();
                formData.append('token', localStorage.getItem("token"));
                formData.append('body', body);
                formData.append('media', file);
               
                
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
                