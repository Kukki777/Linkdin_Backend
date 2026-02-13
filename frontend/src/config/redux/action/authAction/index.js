"use client";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {clientServer} from "../../../index.jsx"

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
      const response = await clientServer.post("/register", {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
);


export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",

  async (token, thunkAPI) => {
    try {

      console.log("Token sent to backend:", token);

      const response = await clientServer.post(
        "/get_user_and_profile",
        {
          token: token, // ✅ send in body
        }
      );

      return response.data;

    } catch (error) {

      console.log("Get User Error:", error);

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to get user"
      );
    }
  }
);

export const getAllUsers= createAsyncThunk(
        "user/getAllUsers",
        async (thunkAPI) => {
            try {
                const response = await clientServer.get("/user/get_all_users");
                return thunkAPI.fulfillWithValue(response.data);
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response?.data?.message || error.message || "Login failed"
                );
            }
        }
    );