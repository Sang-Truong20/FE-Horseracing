import React, { useEffect } from "react";
import AdminLayout from "../../layout/AdminLayout";
import Statistics from "../../component/admin/Statistics";
import UserList from "../../component/admin/UserList";
import JockeyApproval from "../../component/admin/JockeyApproval";

const AdminDashboard = () => {
  useEffect(() => {
    document.title = "Admin Dashboard - Thunder";
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Quản Lý Người Dùng</h1>
            <p className="text-gray-400 mt-2">Tổng quan và quản lý hệ thống Thunder</p>
          </div>
        </div>

        {/* Statistics */}
        <Statistics
          stats={{
            totalUsers: 1284,
            verifiedOwners: 392,
            pendingJockeys: 7,
            withdrawRequests: 248,
          }}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User List - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <UserList />
          </div>

          {/* Jockey Approval - Sidebar */}
          <div className="lg:col-span-1">
            <JockeyApproval />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
