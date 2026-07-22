import React, { useState, useEffect } from 'react';
import { 
  Download, Plus, Filter, ArrowUpDown, LayoutGrid, List,
  ChevronRight, Star, User, Eye, Calendar, Activity, Moon, Circle, Loader2, Trophy, X
} from 'lucide-react';
import api from '../../config/axios'; // Import axios đã config

const JockeyHorses = () => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [horseDetail, setHorseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // 1. GỌI API FETCH DATA
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/jockey/horses');
        
        // Tuỳ thuộc vào backend trả về { data: [...] } hay chỉ là array [...]
        // Thường response.data.data nếu có bọc chuẩn API response, hoặc response.data
        const horseData = response.data.data || response.data || [];
        setHorses(horseData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách ngựa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, []);

  // 2. CÁC HÀM XỬ LÝ SỐ LIỆU TỪ BACKEND
  // Tính tuổi dựa vào dateOfBirth
  const calculateAge = (dob) => {
    if (!dob) return "?";
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // Tính tỷ lệ thắng
  const calculateWinRate = (wins, races) => {
    if (!races || races === 0) return "0%";
    return Math.round((wins / races) * 100) + "%";
  };

  const openHorseDetail = async (horseId) => {
    if (!horseId) return;
    setHorseDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/api/jockey/horses/${horseId}`);
      if (response.data?.status === "Success") {
        setHorseDetail(response.data.data || null);
      } else {
        setDetailError(response.data?.message || "Không thể tải chi tiết ngựa.");
      }
    } catch (error) {
      setDetailError(error.response?.data?.message || "Lỗi khi tải chi tiết ngựa.");
    } finally {
      setDetailLoading(false);
    }
  };

  // Render màu badge cho các mảng đua gần đây (Nếu sau này BE có trả về mảng recentForms)
  const renderFormBadge = (form, idx) => {
    let bgClass = "bg-gray-500/20 text-gray-400";
    if (form === '1st') bgClass = "bg-emerald-500/20 text-emerald-400";
    else if (form === '2nd') bgClass = "bg-purple-500/20 text-purple-400";
    else if (form === '3rd') bgClass = "bg-orange-500/20 text-orange-400";
    else if (form === 'DNF') bgClass = "bg-red-500/20 text-red-400";

    return (
      <span key={idx} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bgClass}`}>
        {form}
      </span>
    );
  };

  // 3. THỐNG KÊ DATA CHO PHẦN CARDS TRÊN CÙNG
  const totalHorses = horses.length;
  const activeHorses = horses.filter(h => h.status === 'Active').length;
  const restingHorses = horses.filter(h => h.status !== 'Active').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
            <span>Tổng quan</span>
            <ChevronRight size={12} />
            <span className="text-[#EBCB75]">Ngựa được gắn</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Ngựa Được Gắn</h1>
          <p className="text-gray-400 text-sm">Quản lý danh sách ngựa thi đấu được phân công cho bạn</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1C152B] border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/5 transition-all">
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C152B] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
            <Circle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Tổng ngựa gắn</p>
            <h3 className="text-xl font-bold text-white">{loading ? '...' : totalHorses} con</h3>
          </div>
        </div>
        <div className="bg-[#1C152B] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Đang hoạt động</p>
            <h3 className="text-xl font-bold text-emerald-400">{loading ? '...' : activeHorses} con</h3>
          </div>
        </div>
        <div className="bg-[#1C152B] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Moon size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Đang nghỉ ngơi</p>
            <h3 className="text-xl font-bold text-orange-400">{loading ? '...' : restingHorses} con</h3>
          </div>
        </div>
        <div className="bg-[#1C152B] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Lịch đua (sắp tới)</p>
            <h3 className="text-xl font-bold text-blue-400">0 buổi</h3>
          </div>
        </div>
      </div>

       <div className="flex justify-end gap-3">
           <button className="flex items-center gap-2 px-4 py-3 bg-[#1C152B] border border-white/5 text-gray-400 rounded-xl text-sm hover:text-white transition-colors">
             <Filter size={16} /> Trạng thái
          </button>
          <div className="flex bg-[#1C152B] border border-white/5 rounded-xl p-1">
            <button className="p-2 bg-purple-600/20 text-purple-400 rounded-lg"><LayoutGrid size={18}/></button>
            <button className="p-2 text-gray-500 hover:text-white"><List size={18}/></button>
           </div>
       </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[#EBCB75]">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Đang tải dữ liệu ngựa...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && horses.length === 0 && (
        <div className="text-center py-20 bg-[#1C152B] rounded-2xl border border-white/5 text-gray-500">
          <Circle className="mx-auto mb-4 opacity-50" size={48} />
          <p>Chưa có con ngựa nào được phân công cho bạn.</p>
        </div>
      )}

      {/* DATA GRID */}
      {!loading && horses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {horses.map((horse) => {
            const isEmerald = horse.status === 'Active';
            const statusText = isEmerald ? 'Hoạt động' : 'Nghỉ ngơi';

            return (
              <div key={horse._id} className="bg-[#1C152B] rounded-2xl border border-white/5 overflow-hidden flex flex-col hover:border-[#EBCB75]/30 transition-colors">
                
                {/* Hình ảnh/Background */}
                <div className={`h-40 relative flex items-center justify-center p-4 bg-gradient-to-b ${
                  isEmerald ? 'from-emerald-900/20 to-transparent' : 'from-orange-900/20 to-transparent'
                }`}>
                  {/* Trạng thái */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#0F0B19]/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${isEmerald ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`}></div>
                    <span className={`text-[10px] font-bold ${isEmerald ? 'text-emerald-400' : 'text-orange-400'}`}>{statusText}</span>
                  </div>
                  
                  {/* Mã & Tuổi */}
                  <div className="absolute bottom-4 left-4 bg-[#0F0B19]/50 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
                    <span className="text-[10px] text-gray-400">{horse.registrationNumber || horse._id.slice(-6)} • {calculateAge(horse.dateOfBirth)} tuổi</span>
                  </div>

                  {/* SVG Ngựa (Mô phỏng) */}
                  <div className={`w-20 h-20 opacity-80 ${isEmerald ? 'text-emerald-500/50' : 'text-orange-500/50'}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2Z"/>
                        <path d="M10 16L6 22H18L14 16H10Z"/>
                    </svg>
                  </div>
                </div>

                {/* Thông tin chính */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{horse.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <User size={12} />
                        <span>Chủ ngựa: {horse.owner?.stableName || horse.owner?.fullName || (typeof horse.owner === "string" ? horse.owner.slice(-6).toUpperCase() : "-")}</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-[#EBCB75] hover:bg-[#EBCB75]/10 transition-colors">
                      <Star size={16} />
                    </button>
                  </div>

                  {/* 3 Box Thống kê - Custom theo API thật */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="bg-[#150F22] rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-1">Tỷ lệ thắng</p>
                      <p className="text-sm font-bold text-[#EBCB75]">
                        {calculateWinRate(horse.totalWins, horse.totalRaces)}
                      </p>
                    </div>
                    <div className="bg-[#150F22] rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-1">Số trận đua</p>
                      <p className="text-sm font-bold text-white">{horse.totalRaces} trận</p>
                    </div>
                    <div className="bg-[#150F22] rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-1">Tốc độ/Thể lực</p>
                      <p className="text-sm font-bold text-blue-400">{horse.speedRating}/{horse.staminaRating}</p>
                    </div>
                  </div>

                  {/* Giới tính & Trọng lượng / Chiều cao */}
                  <div className="mb-5 bg-[#150F22] rounded-xl p-3 border border-white/5 flex justify-between items-center text-sm">
                    <span className="text-gray-400 text-xs">Giới tính: <span className="text-white">{horse.gender}</span></span>
                    <span className="text-gray-400 text-xs">Màu sắc: <span className="text-white">{horse.color}</span></span>
                    <span className="text-gray-400 text-xs">Thể hình: <span className="text-white">{horse.heightCm}cm - {horse.weightKg}kg</span></span>
                  </div>

                  <div className="flex-1"></div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-white/5 mt-auto">
                    <button type="button" onClick={() => openHorseDetail(horse._id)} className="flex items-center justify-center gap-2 py-2.5 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 rounded-xl text-sm font-medium transition-colors">
                      <Eye size={16} /> Chi tiết
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {(detailLoading || detailError || horseDetail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-[28px] border border-white/10 bg-[#0B101A] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#EBCB75]">Chi tiết ngựa</p>
                <h2 className="mt-2 text-2xl font-black text-white">{horseDetail?.horse?.name || "Đang tải..."}</h2>
              </div>
              <button type="button" onClick={() => { setHorseDetail(null); setDetailError(null); }} className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:bg-white/10"><X size={18} /></button>
            </div>

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="py-16 text-center text-[#EBCB75]"><Loader2 className="mx-auto mb-3 animate-spin" size={32} />Đang tải chi tiết ngựa...</div>
              ) : detailError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">{detailError}</div>
              ) : horseDetail && (() => {
                const { horse, stats = {}, upcomingRaces = [], raceHistory = [] } = horseDetail;
                const races = [...upcomingRaces, ...raceHistory];
                return (
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Giống / màu</p><p className="mt-1 font-black text-white">{horse.breed || "-"} / {horse.color || "-"}</p></div>
                      <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Chủ ngựa</p><p className="mt-1 font-black text-white">{horse.owner?.stableName || horse.owner?.fullName || "-"}</p></div>
                      <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Tốc độ / thể lực</p><p className="mt-1 font-black text-cyan-300">{horse.speedRating ?? "-"} / {horse.staminaRating ?? "-"}</p></div>
                      <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Cự ly phù hợp</p><p className="mt-1 font-black text-[#EBCB75]">{horse.preferredDistanceM ? `${horse.preferredDistanceM}m` : "-"}</p></div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-center"><p className="text-xl font-black text-white">{stats.totalRaces ?? 0}</p><p className="mt-1 text-xs text-gray-500">Tổng race</p></div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-center"><p className="text-xl font-black text-emerald-300">{stats.wins ?? 0}</p><p className="mt-1 text-xs text-gray-500">Hạng 1</p></div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-center"><p className="text-xl font-black text-[#EBCB75]">{stats.podiums ?? 0}</p><p className="mt-1 text-xs text-gray-500">Top 3</p></div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-center"><p className="text-xl font-black text-purple-300">{stats.averageRank ?? "-"}</p><p className="mt-1 text-xs text-gray-500">Hạng TB</p></div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2"><Trophy size={18} className="text-[#EBCB75]" /><h3 className="font-black text-white">Lịch sử và lịch đua</h3></div>
                      {races.length ? (
                        <div className="mt-3 space-y-3">
                          {races.map((race, index) => <div key={race._id || race.raceId || index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-bold text-white">{race.name || race.raceName || "Cuộc đua"}</p><p className="mt-1 text-sm text-gray-400">{race.location || "-"} · {race.raceDate ? new Date(race.raceDate).toLocaleString("vi-VN") : "-"}</p><p className="mt-1 text-xs text-[#EBCB75]">Hạng: {race.finalRank ?? race.rank ?? "-"} · Trạng thái: {race.status || "-"}</p></div>)}
                        </div>
                      ) : <p className="mt-3 rounded-2xl bg-white/[0.03] p-5 text-sm text-gray-400">Chưa có lịch sử hoặc lịch đua sắp tới.</p>}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JockeyHorses;
