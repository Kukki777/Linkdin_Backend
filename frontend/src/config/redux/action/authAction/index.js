"use client";
import { createAsyncThunk } from "@reduxjs/toolkit";
// import clientServer from "@reduxjs/toolkit"; 

export const loginUser = createAsyncThunk(
  "user/login",

  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (!response.data.token) {
        return thunkAPI.rejectWithValue("Token not provided");
      }

      localStorage.setItem("token", response.data.token);

      // ✅ Just return data
      return response.data.token;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", user);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
);
