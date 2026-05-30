import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  IdcardOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-500">
            THUNDER ADMIN
          </h1>
        </div>

        <nav className="mt-8">
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dashboard
            </h3>
            <a
              href="/admin"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <DashboardOutlined className="text-lg" />
              <span>Dashboard</span>
            </a>
          </div>

          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quản Lý
            </h3>
            <a
              href="/admin/users"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <UserOutlined className="text-lg" />
              <span>Quản Lý Người Dùng</span>
            </a>
            <a
              href="/admin/owners"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <ShopOutlined className="text-lg" />
              <span>Quản Lý Chủ Ngựa</span>
            </a>
            <a
              href="/admin/jockeys"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <IdcardOutlined className="text-lg" />
              <span>Cấp Phép Jockey</span>
            </a>
          </div>

          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              HỆ THỐNG
            </h3>
            <a
              href="/admin/reports"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <BarChartOutlined className="text-lg" />
              <span>Báo Cáo & Thống Kê</span>
            </a>
            <a
              href="/admin/logs"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <FileTextOutlined className="text-lg" />
              <span>Nhật Ký Hoạt Động</span>
            </a>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">
                {user?.name?.[0] || "A"}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
          >
            <LogoutOutlined />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
