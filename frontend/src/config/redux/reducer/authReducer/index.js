import { createSlice } from "@reduxjs/toolkit";
import {
  getAboutUser,
  getAllUsers,
  getReceivedConnectionRequests,
  getSentConnectionRequests,
  loginUser,
  registerUser,
  respondToConnectionRequest,
  sendConnectionRequest,
} from "../../action/authAction";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  sentConnectionRequests: [],
  receivedConnectionRequests: [],
  all_users: [],
  all_profiles_fetched: false,
  connectionActionLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleloginUser: (state) => {
      state.message = "hello";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    resetTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the Door";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = "Logged In Successfully";
        state.user = action.payload;
        state.loggedIn = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = "Registered Successfully. Now Login";
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload;
      })
      .addCase(getSentConnectionRequests.fulfilled, (state, action) => {
        state.sentConnectionRequests = action.payload;
      })
      .addCase(getSentConnectionRequests.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getReceivedConnectionRequests.fulfilled, (state, action) => {
        state.receivedConnectionRequests = action.payload;
      })
      .addCase(getReceivedConnectionRequests.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(sendConnectionRequest.pending, (state) => {
        state.connectionActionLoading = true;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.connectionActionLoading = false;
        state.sentConnectionRequests = [
          ...state.sentConnectionRequests,
          {
            _id: `temp-${action.payload.connectionId}`,
            connectionId: { _id: action.payload.connectionId },
            status_accepted: null,
          },
        ];
        state.message = action.payload.message;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.connectionActionLoading = false;
        state.message = action.payload;
      })
      .addCase(respondToConnectionRequest.pending, (state) => {
        state.connectionActionLoading = true;
      })
      .addCase(respondToConnectionRequest.fulfilled, (state, action) => {
        state.connectionActionLoading = false;
        state.receivedConnectionRequests = state.receivedConnectionRequests.map((request) =>
          String(request._id) === String(action.payload.requestId)
            ? {
                ...request,
                status_accepted: action.payload.action === "accept",
              }
            : request,
        );
        state.message = action.payload.message;
      })
      .addCase(respondToConnectionRequest.rejected, (state, action) => {
        state.connectionActionLoading = false;
        state.message = action.payload;
      });
  },
});

export const { reset, emptyMessage, setTokenIsThere, resetTokenIsNotThere } =
  authSlice.actions;

export default authSlice.reducer;
