import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "../../../clientServer"; 

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        "email": user.email, 
        "password": user.password
      });
      if(response.data.token){
    localStorage.setItem("token", response.data.token);
      }
      else{
    return thunkAPI.rejectWithValue("Token not provided");
      }

      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);
