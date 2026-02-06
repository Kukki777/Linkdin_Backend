


import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
        user: [],
        isError: false,
        isSuccess: false,
        isLoading: false,
        loggedIn: false,
        Message: "",
        ProfileFetched: false,
        connections: [],
        connectonRequest: [],
    };
    
    const authSlice=createSlice({
        name:"auth",
        initialState,
        reducers:{
            reset:()=>initialState,
            handleloginUser:(state)=>{
                state.message="hello"
            },
            
            }
        }
    )