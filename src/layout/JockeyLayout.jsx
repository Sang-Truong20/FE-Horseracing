import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Bell, Wallet, LogOut, Award, Smartphone, AlertTriangle, Flag } from 'lucide-react'; // Hoặc lucide-react
import { logout } from '../redux/features/userSlice';
import NotificationMenu from '../components/NotificationMenu';

const JockeyLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { icon: <Bell size={18} />, label: 'Yêu cầu đua', path: '/jockey/requests' },
    { icon: <Flag size={18} />, label: 'Cuộc đua', path: '/jockey/races' },
    { icon: <Award size={18} />, label: 'Ngựa được gắn', path: '/jockey/horses' },
    { icon: <AlertTriangle size={18} />, label: 'Án phạt & kháng án', path: '/jockey/penalties' },
  ];

  return (
    <div className="flex h-screen bg-[#0F0B19] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#150F22] border-r border-white/5 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-[#EBCB75] rounded-lg flex items-center justify-center">
            <Award className="text-black" size={20} />
          </div>
          <span className="font-bold text-lg tracking-wide">JOCKEYHUB</span>
        </div>

        {/* Profile */}
        <div className="p-6 flex flex-col items-center border-b border-white/5">
          <div className="w-16 h-16 rounded-full bg-[#6B32F7] flex items-center justify-center text-xl font-bold mb-3 shadow-[0_0_15px_rgba(107,50,247,0.4)]">
            NH
          </div>
          <h3 className="font-semibold text-md">Nguyễn Văn Hùng</h3>
          <div className="flex items-center gap-1 text-xs text-[#EBCB75] mt-1 bg-[#EBCB75]/10 px-2 py-1 rounded-full border border-[#EBCB75]/20">
            <Award size={12} /> Jockey Pro - JK-0042
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 mb-2 mt-4 uppercase tracking-wider">Menu Chính</p>
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/jockey'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-[#EBCB75] text-black font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <p className="px-3 text-xs font-semibold text-gray-500 mb-2 mt-6 uppercase tracking-wider">Tài khoản</p>
          <NavLink to="/jockey/wallet" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <Wallet size={18} /> <span className="text-sm">Quản lý ví</span>
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all mt-2">
            <LogOut size={18} /> <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#150F22] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-6 text-sm text-gray-400 hidden md:flex">
            <span>📞 Hotline: 1900 6868</span>
            <span>✉️ support@duarua.vn</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 text-sm text-[#EBCB75] bg-[#EBCB75]/10 px-3 py-1.5 rounded-lg border border-[#EBCB75]/20 hover:bg-[#EBCB75]/20 transition-all">
                <Smartphone size={16}/> Tải ứng dụng
             </button>
             <NotificationMenu
               buttonClassName="relative flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition-all hover:bg-white/10 hover:text-white"
               unreadDotClassName="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white flex items-center justify-center"
               panelClassName="right-0"
             />
          </div>
        </header>

        {/* Page Content (Dashboard) */}
        <div className="flex-1 overflow-auto bg-[#0F0B19] p-6">
          {children || <Outlet />}
        </div>
      </main>

    </div>
  );
};

export default JockeyLayout;
