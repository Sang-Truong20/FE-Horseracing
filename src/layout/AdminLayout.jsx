import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/userSlice";
import { NavLink, useNavigate } from "react-router-dom";
import NotificationMenu from "../components/NotificationMenu";
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  IdcardOutlined,
  FlagOutlined,
  GiftOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LogoutOutlined,

  BankOutlined,

  WalletOutlined,

} from "@ant-design/icons";

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
        : "text-gray-300 hover:bg-purple-500/20 hover:text-white"
    }`;

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
            <NavLink
              to="/admin"
              end
              className={navLinkClass}
            >
              <DashboardOutlined className="text-lg" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quản Lý
            </h3>
            <NavLink
              to="/admin/users"
              className={navLinkClass}
            >
              <UserOutlined className="text-lg" />
              <span>Quản Lý Người Dùng</span>
            </NavLink>
            <NavLink
              to="/admin/owners"
              className={navLinkClass}
            >
              <ShopOutlined className="text-lg" />
              <span>Quản Lý Chủ Ngựa</span>
            </NavLink>
            <NavLink
              to="/admin/jockeys"
              className={navLinkClass}
            >
              <IdcardOutlined className="text-lg" />
              <span>Cấp Phép Jockey</span>
            </NavLink>
            <NavLink
              to="/admin/referees"
              className={navLinkClass}
            >
              <FlagOutlined className="text-lg" />
              <span>Quản Lý Trọng Tài</span>
            </NavLink>
            <NavLink
              to="/admin/races"
              className={navLinkClass}
            >
              <FlagOutlined className="text-lg" />
              <span>Quản Lý Cuộc Đua</span>
            </NavLink>
            <NavLink
              to="/admin/gifts"
              className={navLinkClass}
            >
              <GiftOutlined className="text-lg" />
              <span>Quà Tặng</span>
            </NavLink>
            <NavLink
              to="/admin/withdrawals"
              className={navLinkClass}
            >

              <BankOutlined className="text-lg" />

              <WalletOutlined className="text-lg" />

              <span>Quản Lý Rút Tiền</span>
            </NavLink>
          </div>

          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              HỆ THỐNG
            </h3>
            <NavLink
              to="/admin/reports"
              className={navLinkClass}
            >
              <BarChartOutlined className="text-lg" />
              <span>Báo Cáo & Thống Kê</span>
            </NavLink>
            <NavLink
              to="/admin/logs"
              className={navLinkClass}
            >
              <FileTextOutlined className="text-lg" />
              <span>Nhật Ký Hoạt Động</span>
            </NavLink>
          </div>
        </nav>

        <div className="px-4 py-2">
          <NotificationMenu
            buttonClassName="relative flex w-full items-center justify-between space-x-3 rounded-lg px-4 py-2 text-gray-300 transition hover:bg-purple-500/20 hover:text-white"
            unreadDotClassName="absolute top-1 right-2 min-w-5 h-5 rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white flex items-center justify-center"
            panelClassName="left-4 right-4 w-auto"
            placementClassName="left-0"
          />
        </div>

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
