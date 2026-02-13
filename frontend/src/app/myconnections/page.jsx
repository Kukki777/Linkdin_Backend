import React from 'react'
import UserLayout from '../user/page';
import DashboardLayout from '../dashboardLayout/page';

export default function MyConnections() {
  return (
    <UserLayout>
      {/* {authState.profileFetched && <div>
       Hey {authState.user?.userId?.name}
    </div>} */}
     <DashboardLayout>
        <div>
          <h1>My Connections</h1>
        </div>
     </DashboardLayout>
    </UserLayout>
  );
}
