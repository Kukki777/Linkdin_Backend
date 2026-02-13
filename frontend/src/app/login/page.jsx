"use client";
import React, { useState } from 'react'
import UserLayout from '../user/page';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
// import {store} from '../../config/redux/store'
import { useRouter } from 'next/navigation';
// @ts-expect-error
import styles from "./style.module.css";
import { loginUser, registerUser } from '../../config/redux/action/authAction';
import {emptyMessage} from '../../config/redux/reducer/authReducer';

function LoginComponent() {
  const authState=useSelector(state=>state.auth)
  const router=useRouter();
  const dispatch=useDispatch();
  const [isLoginMethod, setIsLoginMethod] = useState(false);
  const[email,setEmailAddress]=useState("");
  const[password,setPassword]=useState("");
  const[username,setUsername]=useState("");
  const[name,setName]=useState("");
 useEffect(() => {
  if (authState.loggedIn) {
    router.push("/dashboard");
  }
}, [authState.loggedIn]);
 
useEffect(() => {
  dispatch(emptyMessage());
},[isLoginMethod]);

useEffect(() => {
  if(localStorage.getItem("token")){
    router.push("/dashboard");
  }
},[])
  const handleRegister = async () => {

  console.log("register clicked");
  const res = await dispatch(
    registerUser({
      username,
      name,
      email,
      password,
    })
  );
  console.log("Redux Response:", res);
};

const handleLogin = async () => {
  console.log("login clicked");
  const res = await dispatch(
    loginUser({
      email,
      password,
    })
  );
  console.log("Redux Response:", res);
};

  return (
    <UserLayout>
      <div className={styles.container}>
      <div className={styles.cardContainer}>
        <div className={styles.cardContainer__left}>
          <p className={styles.cardleft__heading}>{isLoginMethod?"Sign In" : "Sign Up"}</p>
          <p style={{color:authState.isError?"red":"green"}}>{authState.message}</p>

          <div className={styles.inputContainers}>
            {!isLoginMethod &&<div className={styles.inputRow}>
              <input onChange={(e)=>{setUsername(e.target.value)}} className={styles.inputField} type="text" placeholder='Username'></input>
              <input onChange={(e)=>{setName(e.target.value)}} className={styles.inputField} type="text" placeholder='Name'></input>  
            </div>}
             <input onChange={(e)=>{setEmailAddress(e.target.value)}} className={styles.inputField} type="email" placeholder='Email'></input>
              <input onChange={(e)=>{setPassword(e.target.value)}} className={styles.inputField} type="password" placeholder='Password'></input>
            <div onClick={()=>{
              if(isLoginMethod){
                handleLogin();
              }
              else{
                handleRegister();
              }
            }
            } className={styles.buttonWithOutline}>
              <p>{isLoginMethod?"Sign In" : "Sign Up"}</p>
            </div>
          </div>
      </div>

        <div className={styles.cardContainer__right}>
          
            {isLoginMethod?<p>Don't have an account? </p>:<p>Already have an account? </p>}
               <div onClick={()=>{
             setIsLoginMethod(!isLoginMethod);
            }
            } style={{color:"black", textAlign:"center"}}className={styles.buttonWithOutline}>
              <p>{isLoginMethod?"Sign Up" : "Sign In"}</p>
            </div>
            
        </div>
      </div>
      </div>
    </UserLayout>
  )
}

export default LoginComponent;