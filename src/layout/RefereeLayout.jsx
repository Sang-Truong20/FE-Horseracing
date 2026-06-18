import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Search, ShieldCheck } from "lucide-react";
import { logout } from "../redux/features/userSlice";
import NotificationMenu from "../components/NotificationMenu";

const RefereeLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const location = useLocation();

  const menuItems = [
    { label: "Trọng Tài Race Ngựa", icon: <ShieldCheck size={18} />, path: "/referee" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#05060D] text-white font-sans">
      <aside className="w-80 border-r border-white/5 bg-[#0A0C16] flex flex-col">
        <div className="px-8 py-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4D7CFF] to-[#26D7C8] flex items-center justify-center text-black font-black shadow-[0_15px_40px_rgba(38,215,200,0.25)]">
              TH
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Thunder</p>
              <h1 className="text-xl font-black tracking-tight">Race Referee</h1>
            </div>
          </div>
          <p className="text-sm text-gray-400">Duyệt jockey và preview/chốt kết quả cuộc đua ngựa.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">Chức năng trọng tài</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between gap-3 rounded-3xl px-4 py-4 text-left text-sm font-semibold transition-all ${isActive ? "bg-[#2F3B61] text-white shadow-[0_15px_40px_rgba(55,81,159,0.18)]" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {item.path === "/referee" && <span className="rounded-full bg-[#D9A520] px-2 py-1 text-[10px] font-black text-black">3</span>}
              </button>
            );
          })}

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Luồng xử lý</p>
            <p className="text-sm text-gray-400">Dashboard hiển thị race theo bucket, danh sách jockey pending, detail race và preview xếp hạng.</p>
          </div>
        </div>

        <div className="px-8 pb-8 pt-4 border-t border-white/10">
          <div className="rounded-3xl bg-[#111827] p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5B3CFF] to-[#26D7C8] flex items-center justify-center text-sm font-black text-black">R</div>
              <div>
                <p className="text-sm font-semibold">{user?.fullName || "Referee"}</p>
                <p className="text-[11px] text-gray-500">{user?.role || "Referee"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#090B15] px-8 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Race Referee</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Trọng Tài Cuộc Đua Ngựa</h2>
            <p className="mt-2 text-sm text-gray-400">Duyệt jockey, xem race được phân công và preview kết quả.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationMenu
              buttonClassName="relative rounded-3xl border border-white/10 bg-white/5 p-3 text-gray-300 transition-all hover:bg-white/10 hover:text-white"
              unreadDotClassName="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white flex items-center justify-center"
              panelClassName="right-0"
            />
            <div className="relative rounded-3xl bg-[#0F1322] border border-white/10 px-4 py-3">
              <Search size={18} className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm cuộc đua..."
                className="bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#05060D]">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default RefereeLayout;
