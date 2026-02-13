'use client';
import React, { useEffect } from 'react'
import UserLayout from '../user/page'
import DashboardLayout from '../dashboardLayout/page'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers } from '../../config/redux/action/authAction';

export default function DiscoverPage() {
  const authState=useSelector(state=>state.auth);
  const disptach=useDispatch();
  useEffect(() => {
    if(!authState.all_profiles_fetched){
      disptach(getAllUsers());
    }
  },[])
  return (
    <UserLayout>
        <DashboardLayout>

            <div>discover</div>
            </DashboardLayout>
    </UserLayout>
    
  )
}
