"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../index.jsx";

export const loginUser = createAsyncThunk("user/login", async (user, thunkAPI) => {
  try {
    const response = await clientServer.post("/login", {
      email: user.email,
      password: user.password,
    });

    if (!response.data.token) {
      return thunkAPI.rejectWithValue("Token not provided");
    }

    localStorage.setItem("token", response.data.token);
    return response.data.token;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || "Login failed",
    );
  }
});

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
        error.response?.data?.message || error.message || "Registration failed",
      );
    }
  },
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (token, thunkAPI) => {
    try {
      const response = await clientServer.post("/get_user_and_profile", { token });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to get user",
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch users",
      );
    }
  },
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async ({ token, connectionId }, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/send_connection_request", {
        token,
        connectionId,
      });
      return { message: response.data?.message || "", connectionId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to send connection request",
      );
    }
  },
);

export const getSentConnectionRequests = createAsyncThunk(
  "user/getSentConnectionRequests",
  async (token, thunkAPI) => {
    try {
      const response = await clientServer.get("/getConnectionRequests", {
        params: { token },
      });
      return Array.isArray(response.data?.connections)
        ? response.data.connections
        : Array.isArray(response.data)
          ? response.data
          : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to get sent connection requests",
      );
    }
  },
);

export const getReceivedConnectionRequests = createAsyncThunk(
  "user/getReceivedConnectionRequests",
  async (token, thunkAPI) => {
    try {
      const response = await clientServer.get("/getMyConnectionRequests", {
        params: { token },
      });
      return Array.isArray(response.data?.connections)
        ? response.data.connections
        : Array.isArray(response.data)
          ? response.data
          : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to get received connection requests",
      );
    }
  },
);

export const respondToConnectionRequest = createAsyncThunk(
  "user/respondToConnectionRequest",
  async ({ token, requestId, action }, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/accept_connection_request", {
        token,
        requestId,
        action_type: action,
      });
      return {
        message: response.data?.message || "",
        requestId,
        action,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update connection request",
      );
    }
  },
);
