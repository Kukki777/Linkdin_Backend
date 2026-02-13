import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../..";








export const getAllPosts= createAsyncThunk(
        "post/getAllPosts",
        async (thunkAPI) => {
            try {
                const response = await clientServer.get("/posts");
                return thunkAPI.fulfillWithValue(response.data);
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response?.data?.message || error.message || "Login failed"
                );
            }
        }
    );