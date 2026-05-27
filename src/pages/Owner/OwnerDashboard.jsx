import React, { useEffect, useState } from "react";
import { Trophy, MoreHorizontal, Eye, Edit3, ChevronRight } from "lucide-react";
import api from "../../config/axios";

const OwnerDashboard = () => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHorses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/owner/horses");
      if (response.data?.status === "Success") {
        setHorses(response.data.data || []);
      } else {
        setError(response.data?.message || "Không lấy được danh sách ngựa");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorses();
    const refresh = () => fetchHorses();
    window.addEventListener("horseCreated", refresh);
    return () => window.removeEventListener("horseCreated", refresh);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECTION: HORSE LIST TABLE */}
      <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
         {/* Table Header Controls */}
         <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Danh Sách Ngựa</h3>
                <span className="bg-[#D9A520]/10 text-[#D9A520] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-[#D9A520]/20">
                  {loading ? "Đang tải..." : `${horses.length} con ngựa`}
                </span>
            </div>
            
            <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-tighter">
               <button className="bg-[#D9A520] text-black px-5 py-2.5 rounded-xl shadow-lg transition-all">Tất cả</button>
               <button className="px-5 py-2.5 text-gray-500 hover:text-white transition-colors">Đang Thi Đấu</button>
               <button className="px-5 py-2.5 text-gray-500 hover:text-white transition-colors">Nghỉ Ngơi</button>
            </div>
         </div>
         
         {/* Table Content */}
         <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Đang tải danh sách ngựa...</div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-red-400">{error}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 border-b border-white/5">
                    <th className="px-8 py-5">Tên ngựa</th>
                    <th className="px-8 py-5">Giống loài</th>
                    <th className="px-8 py-5 text-center">Màu sắc</th>
                    <th className="px-8 py-5 text-center">Giới tính</th>
                    <th className="px-8 py-5 text-center">Trạng thái</th>
                    <th className="px-8 py-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {horses.map((horse, idx) => (
                    <tr key={horse._id || idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D9A520] to-[#B8860B] flex items-center justify-center font-black text-black text-lg shadow-lg shadow-yellow-500/10 group-hover:scale-110 transition-transform">
                            {horse.name?.charAt(0) || "H"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white group-hover:text-[#D9A520] transition-colors">{horse.name}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Mã: {horse.registrationNumber || horse._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-medium text-gray-400 italic">{horse.breed}</td>
                      <td className="px-8 py-6 text-center text-xs font-bold text-gray-300">{horse.color || "-"}</td>
                      <td className="px-8 py-6 text-center text-xs font-bold text-gray-300">{horse.gender || "-"}</td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/10 text-[#D9A520] tracking-tighter">
                          {horse.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-[#D9A520] transition-all border border-white/5">
                            <Eye size={16}/>
                          </button>
                          <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-emerald-500 transition-all border border-white/5">
                            <Edit3 size={16}/>
                          </button>
                          <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5">
                            <MoreHorizontal size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
         </div>

         {/* Table Pagination */}
         <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/10">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Hiển thị 4 / 12 ngựa</p>
            <div className="flex gap-2">
               <button className="p-2 bg-white/5 rounded-lg text-gray-600 hover:text-white transition-colors border border-white/5 cursor-not-allowed">
                  <ChevronRight size={16} className="rotate-180" />
               </button>
               <button className="w-8 h-8 bg-[#D9A520] text-black rounded-lg text-xs font-black">1</button>
               <button className="w-8 h-8 bg-white/5 text-gray-500 rounded-lg text-xs font-bold hover:text-white hover:bg-white/10 transition-all">2</button>
               <button className="w-8 h-8 bg-white/5 text-gray-500 rounded-lg text-xs font-bold hover:text-white hover:bg-white/10 transition-all">3</button>
               <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors border border-white/5">
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

// ĐẢM BẢO CÓ DÒNG NÀY ĐỂ HẾT LỖI IMPORT
export default OwnerDashboard;