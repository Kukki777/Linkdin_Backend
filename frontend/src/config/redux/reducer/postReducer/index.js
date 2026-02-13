import { createSlice } from "@reduxjs/toolkit";
import { getAllPost } from "../../action/postAction";
import { getAllPosts } from "../../action/postAction";





const initialState = {
    posts: [],
    isError: false,
    postFetched: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    comments:[],
    postId:""
  };


  const postSlice=createSlice({
    name:"post",
    initialState,
    reducers:{
        reset: () => initialState,
        resetPostId:(state)=>{
            state.postId=""
        },
    },
    extraReducers: (builder) => {
        builder
          .addCase(getAllPosts.pending, (state) => {
            state.isLoading = true;
            state.message = "Fetching All the Posts";
          })
          .addCase(getAllPosts.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "Posts Fetched Successfully";
            state.posts = action.payload.posts;
            state.postFetched = true;
          })
          .addCase(getAllPosts.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
          });
      },
  })


  export default postSlice.reducer