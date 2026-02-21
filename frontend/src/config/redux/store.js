//*Steps for state management
//*Submit Action
//*Handle Actions
//*Handle Actions in its reducer
//*Register reducer
"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer
  },
});

export default store; 
