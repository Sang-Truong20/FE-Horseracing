import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { logout } from "../redux/features/userSlice";
import api from "../config/axios";
import { alertSuccess, alertFail } from "../assets/hook/useNotification";
import { 
  LayoutDashboard, Users, ClipboardList, Wallet, 
  Trophy, Flame, DollarSign, LogOut, Search, Bell, PlusCircle
} from "lucide-react";

const OwnerLayout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAddHorseModal, setShowAddHorseModal] = useState(false);
  const [creatingHorse, setCreatingHorse] = useState(false);
  const [newHorse, setNewHorse] = useState({
    name: "",
    breed: "",
    color: "",
    gender: "",
    dateOfBirth: "",
    weightKg: "",
    heightCm: "",
    registrationNumber: "",
    status: "Active",
    notes: "",
  });

  const location = useLocation();

  const getTitleFromRoute = () => {
    switch (location.pathname) {
      case "/owner":
        return "Quản Lý Đua Ngựa";
      case "/owner/jockey":
        return "Gắn Jockey Cho Ngựa";
      case "/owner/races":
        return "Đăng Ký Vào Cuộc Đua";
      case "/owner/wallet":
        return "Quản Lý Ví";
      case "/owner/horses":
        return "Quản Lý Ngựa";
      default:
        return "Quản Lý Đua Ngựa";
    }
  };

  const menuItems = [
    { to: "/owner", icon: <LayoutDashboard size={20}/>, label: "Quản Lý Đua Ngựa", badge: 4 },
    { to: "/owner/jockey", icon: <Users size={20}/>, label: "Gắn Jockey Cho Ngựa" },
    { to: "/owner/races", icon: <ClipboardList size={20}/>, label: "Đăng Ký Vào Cuộc Đua" },
    { to: "/owner/wallet", icon: <Wallet size={20}/>, label: "Quản Lý Ví" },
  ];

  return (
    <div className="flex min-h-screen bg-[#05070A] text-gray-300 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 space-y-8 bg-[#0D1117]/50">
        <div className="flex items-center space-x-3 px-2">
          <div className="bg-[#D9A520] p-2 rounded-lg text-black"><Trophy size={20}/></div>
          <div>
             <h1 className="font-black text-white leading-tight uppercase tracking-tighter">Thunder <span className="text-[#D9A520]">Track</span></h1>
             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Management System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-semibold">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest px-2 pb-2">Owner Portal</p>
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => item.to && navigate(item.to)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') item.to && navigate(item.to); }}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${((item.to === '/owner' && location.pathname === '/owner') || (item.to !== '/owner' && location.pathname.startsWith(item.to))) ? "bg-[#D9A520]/10 text-[#D9A520] border border-[#D9A520]/20" : "hover:bg-white/5"}`}>
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && <span className="bg-[#D9A520] text-black text-[10px] px-2 py-0.5 rounded-full font-black">{item.badge}</span>}
            </div>
          ))}

          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest px-2 pt-8 pb-2">Thống kê nhanh</p>
          <div className="space-y-4 px-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
               <span className="flex items-center gap-2"><Trophy size={14}/> Tổng chiến thắng</span>
               <span className="text-[#D9A520] font-bold">27</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
               <span className="flex items-center gap-2"><Flame size={14}/> Đua đang mở</span>
               <span className="text-purple-500 font-bold">3</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
               <span className="flex items-center gap-2"><DollarSign size={14}/> Doanh thu</span>
               <span className="text-emerald-500 font-bold">₫ 84M</span>
            </div>
          </div>
        </nav>

        {/* User Button (Góc dưới Sidebar) */}
        <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
           <div className="flex items-center justify-between group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                   {user?.fullName?.charAt(0) || "U"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate w-24 uppercase">{user?.username}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Owner • VIP</p>
                </div>
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  navigate("/login");
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors border border-white/10 px-3 py-2 rounded-xl"
              >
                <LogOut size={16} />
                <span className="text-[10px] uppercase tracking-widest font-black">Logout</span>
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5">
           <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
             <span>Owner Portal</span> <span className="opacity-30">/</span> <span className="text-white">{getTitleFromRoute()}</span>
           </div>
           <div className="flex items-center space-x-6">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="text" placeholder="Tìm kiếm ngựa..." className="bg-black/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#D9A520]/50 w-64 transition-all" />
             </div>
             <button className="p-2.5 bg-white/5 rounded-xl text-gray-400 hover:text-white relative transition-colors">
                <Bell size={20}/>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
             </button>
             <button
               onClick={() => setShowAddHorseModal(true)}
               className="flex items-center space-x-2 bg-[#D9A520] text-black font-black px-5 py-2.5 rounded-xl shadow-[0_5px_15px_rgba(217,165,32,0.2)] hover:opacity-90 transition-all text-xs uppercase tracking-tighter"
             >
                <PlusCircle size={18}/>
                <span>Thêm Ngựa Mới</span>
             </button>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
           {children}
        </div>
        {showAddHorseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
            <div className="w-full max-w-2xl rounded-[32px] bg-[#0B101A] border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-black text-white">Tạo ngựa mới</h2>
                  <p className="text-xs text-gray-400">Nhập thông tin cơ bản để tạo ngựa mới cho owner.</p>
                </div>
                <button
                  onClick={() => setShowAddHorseModal(false)}
                  className="text-gray-400 hover:text-white"
                >Đóng</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={newHorse.name}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Tên ngựa"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  />
                  <select
                    value={newHorse.breed}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, breed: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  >
                    <option value="" className="text-gray-400">Chọn giống loài</option>
                    <option value="Thoroughbred">Thoroughbred</option>
                    <option value="Arabian">Arabian</option>
                    <option value="Quarter Horse">Quarter Horse</option>
                    <option value="Standardbred">Standardbred</option>
                    <option value="Appaloosa">Appaloosa</option>
                    <option value="Mustang">Mustang</option>
                  </select>
                  <input
                    value={newHorse.color}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, color: e.target.value }))}
                    placeholder="Màu sắc"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  />
                  <select
                    value={newHorse.gender}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  >
                    <option value="" className="text-gray-400">Chọn giới tính</option>
                    <option value="Stallion">Stallion</option>
                    <option value="Mare">Mare</option>
                  </select>
                  <input
                    type="date"
                    value={newHorse.dateOfBirth}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  />
                  <input
                    value={newHorse.registrationNumber}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="Mã đăng ký"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  />
                  <input
                    type="number"
                    value={newHorse.weightKg}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, weightKg: e.target.value }))}
                    placeholder="Cân nặng (kg)"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  />
                  <input
                    type="number"
                    value={newHorse.heightCm}
                    onChange={(e) => setNewHorse((prev) => ({ ...prev, heightCm: e.target.value }))}
                    placeholder="Chiều cao (cm)"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                  />
                </div>
                <textarea
                  value={newHorse.notes}
                  onChange={(e) => setNewHorse((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú"
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50"
                />
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#04070C]">
                <button
                  onClick={() => setShowAddHorseModal(false)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5 transition-all"
                >Hủy</button>
                <button
                  onClick={async () => {
                    setCreatingHorse(true);
                    try {
                      const payload = {
                        name: newHorse.name,
                        breed: newHorse.breed,
                        color: newHorse.color,
                        gender: newHorse.gender,
                        dateOfBirth: newHorse.dateOfBirth,
                        weightKg: Number(newHorse.weightKg) || 0,
                        heightCm: Number(newHorse.heightCm) || 0,
                        registrationNumber: newHorse.registrationNumber,
                        status: newHorse.status,
                        notes: newHorse.notes,
                      };
                      const response = await api.post("/api/owner/horses", payload);
                      if (response.data?.status === "Success") {
                        alertSuccess(response.data?.message || "Tạo ngựa mới thành công");
                        window.dispatchEvent(new Event("horseCreated"));
                        setShowAddHorseModal(false);
                        setNewHorse({
                          name: "",
                          breed: "",
                          color: "",
                          gender: "",
                          dateOfBirth: "",
                          weightKg: "",
                          heightCm: "",
                          registrationNumber: "",
                          status: "Active",
                          notes: "",
                        });
                      } else {
                        alertFail(response.data?.message || "Tạo ngựa thất bại");
                      }
                    } catch (err) {
                      alertFail(err.response?.data?.message || err.message || "Lỗi khi tạo ngựa");
                    } finally {
                      setCreatingHorse(false);
                    }
                  }}
                  disabled={creatingHorse}
                  className="rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingHorse ? "Đang tạo..." : "Tạo ngựa mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


export default OwnerLayout;