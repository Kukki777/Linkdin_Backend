"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getAllPosts } from "../../config/redux/action/postAction";
import { getAboutUser, getAllUsers } from "../../config/redux/action/authAction";

import UserLayout from "../user/page";
import DashboardLayout from "../dashboardLayout/page";
import { setTokenIsThere } from "../../config/redux/reducer/authReducer";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

//   const [isTokenThere, setIsTokenThere] = useState(null);

  // Fetch data after token exists
  useEffect(() => {
    if (isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
      useEffect(() => {
        if(!authState.all_profiles_fetched){
          disptach(getAllUsers());
        }
      },[])
  }, [authState.isTokenThere]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Dashboard</h1>

          {authState.profileFetched && (
            <p>Hey {authState.user?.userId?.name}</p>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
