import React from 'react';
import { Wallet, Flag, Trophy, Activity, Check, X, ArrowDownToLine, ArrowUpToLine, Bell, Calendar, } from 'lucide-react';

const JockeyDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Tiêu đề */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-[#EBCB75] rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">Tổng quan Jockey</h1>
        </div>
        <p className="text-gray-400 text-sm">Xin chào Hùng! Hôm nay bạn có 3 yêu cầu đua mới đang chờ xử lý.</p>
      </div>

      {/* 4 Cards Thống Kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#1C152B] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-gray-400">Tổng thu nhập</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBCB75]/10 flex items-center justify-center text-[#EBCB75]">
              <Wallet size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">24.900.000 ₫</h3>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <ArrowUpToLine size={12}/> +12% so với tháng trước
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1C152B] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-gray-400">Số buổi đua</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Flag size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">18 buổi</h3>
          <p className="text-xs text-gray-500">Tháng 6/2026</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1C152B] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-gray-400">Tỉ lệ thắng</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Trophy size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">66.7%</h3>
          <p className="text-xs text-gray-500">12/18 lần thắng</p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1C152B] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-gray-400">Ngựa đang gắn</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Activity size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">3 con</h3>
          <p className="text-xs text-[#EBCB75]">2 đang hoạt động</p>
        </div>
      </div>

      {/* Main Grid: Yêu cầu đua & Cột phải */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI (Chiếm 2 phần): Yêu cầu đua */}
        <div className="lg:col-span-2 bg-[#1C152B] rounded-2xl border border-white/5 p-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#EBCB75] rounded-full"></div>
              <h2 className="text-lg font-bold text-white">Yêu cầu đua mới</h2>
              <span className="text-xs text-gray-400 ml-2">Chờ bạn xác nhận</span>
            </div>
            <span className="bg-red-500/10 text-red-400 text-xs px-3 py-1 rounded-full font-medium border border-red-500/20">3 yêu cầu mới</span>
          </div>

          <div className="space-y-4">
            {/* Item Yêu cầu 1 */}
            <div className="bg-[#150F22] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EBCB75]/20 flex items-center justify-center text-[#EBCB75] flex-shrink-0">
                    <Flag size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">Giải đua Mùa Hè 2026</h4>
                    <p className="text-xs text-gray-400 mt-1">Trường đua Phú Thọ • 15/07/2026</p>
                  </div>
                </div>
                <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-1 rounded border border-orange-500/30 uppercase font-bold">🔥 Gấp</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                <span className="text-gray-300"><span className="text-gray-500">Thuê:</span> 3.500.000 ₫</span>
                <span className="text-[#EBCB75] font-medium"><span className="text-gray-500">🏆 Thưởng:</span> 8.000.000 ₫</span>
                <span className="text-gray-300"><span className="text-gray-500">Ngựa:</span> Thunder Bolt</span>
              </div>
              <div className="flex gap-3 justify-end border-t border-white/5 pt-3">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                  <X size={16}/> Từ chối
                </button>
                <button className="px-5 py-2 rounded-lg text-sm font-bold text-black bg-[#EBCB75] hover:bg-[#d9a520] transition-colors flex items-center gap-2">
                  <Check size={16}/> Chấp nhận
                </button>
              </div>
            </div>

            {/* Item Yêu cầu 2 */}
            <div className="bg-[#150F22] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <Flag size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">Giải Vô Địch Miền Nam</h4>
                    <p className="text-xs text-gray-400 mt-1">Trường đua Bình Dương • 22/07/2026</p>
                  </div>
                </div>
                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-1 rounded border border-purple-500/30 uppercase font-bold">Thường</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                <span className="text-gray-300"><span className="text-gray-500">Thuê:</span> 2.800.000 ₫</span>
                <span className="text-[#EBCB75] font-medium"><span className="text-gray-500">🏆 Thưởng:</span> 5.000.000 ₫</span>
                <span className="text-gray-300"><span className="text-gray-500">Ngựa:</span> Silver Wind</span>
              </div>
              <div className="flex gap-3 justify-end border-t border-white/5 pt-3">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                  <X size={16}/> Từ chối
                </button>
                <button className="px-5 py-2 rounded-lg text-sm font-bold text-black bg-[#EBCB75] hover:bg-[#d9a520] transition-colors flex items-center gap-2">
                  <Check size={16}/> Chấp nhận
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (Chiếm 1 phần): Ngựa & Ví */}
        <div className="space-y-6">
          
          {/* Box Ngựa được gắn */}
          <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#EBCB75] rounded-full"></div>
                <h2 className="text-lg font-bold text-white">Ngựa được gắn</h2>
              </div>
              <button className="text-xs text-[#EBCB75] hover:underline">Xem tất cả &gt;</button>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Thunder Bolt', code: 'TB-001 • 5 tuổi', status: 'Hoạt động', color: 'emerald' },
                { name: 'Silver Wind', code: 'SW-003 • 4 tuổi', status: 'Hoạt động', color: 'emerald' },
                { name: 'Golden Flash', code: 'GF-007 • 6 tuổi', status: 'Nghỉ ngơi', color: 'gray' },
              ].map((horse, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#150F22] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#6B32F7] flex items-center justify-center p-0.5">
                       <div className="w-full h-full bg-[#6B32F7]/50 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{horse.name}</p>
                      <p className="text-[10px] text-gray-500">{horse.code}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${horse.color === 'emerald' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-gray-500/30 text-gray-400 bg-gray-500/10'}`}>
                    {horse.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Box Quản lý Ví */}
          <div className="bg-gradient-to-br from-[#261A3D] to-[#150F22] rounded-2xl border border-[#EBCB75]/20 p-5 relative overflow-hidden">
             {/* Icon background mờ */}
             <Wallet className="absolute -right-6 -bottom-6 text-white/5" size={120} />
             
             <div className="relative z-10">
                <p className="text-sm text-gray-300 mb-1">Số dư khả dụng</p>
                <h2 className="text-3xl font-bold text-white mb-6">12.450.000 ₫</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><ArrowDownToLine size={12} className="text-emerald-400"/> Thu vào</p>
                    <p className="font-bold text-white text-sm">18.200.000 ₫</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><ArrowUpToLine size={12} className="text-red-400"/> Chi ra</p>
                    <p className="font-bold text-white text-sm">5.750.000 ₫</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                    Nạp tiền
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl bg-[#EBCB75] text-black text-sm font-bold hover:bg-[#d9a520] transition-colors">
                    Rút tiền
                  </button>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Bảng Lịch sử Thu nhập */}
      <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#EBCB75] rounded-full"></div>
            <h2 className="text-lg font-bold text-white">Lịch sử thu nhập & Thưởng</h2>
            <span className="text-xs text-gray-400 ml-2">Các khoản thanh toán gần nhất</span>
          </div>
          <button className="text-sm bg-[#150F22] border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Calendar size={14} /> Tháng 6/2026
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="pb-3 font-medium">Sự kiện đua</th>
                <th className="pb-3 font-medium">Ngày</th>
                <th className="pb-3 font-medium">Ngựa</th>
                <th className="pb-3 font-medium text-right">Tiền thuê</th>
                <th className="pb-3 font-medium text-right">Tiền thưởng</th>
                <th className="pb-3 font-medium text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {/* Row 1 */}
              <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-4 text-white font-medium">Giải Mùa Hè - Vòng Chung Kết</td>
                <td className="py-4 text-gray-400">10/06/2026</td>
                <td className="py-4">Thunder Bolt</td>
                <td className="py-4 text-right font-medium">3.500.000 ₫</td>
                <td className="py-4 text-right font-medium text-emerald-400">8.000.000 ₫</td>
                <td className="py-4 text-center">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-1 rounded-full">Thắng 🏆</span>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-4 text-white font-medium">Cúp Mùa Xuân - Vòng 2</td>
                <td className="py-4 text-gray-400">05/06/2026</td>
                <td className="py-4">Silver Wind</td>
                <td className="py-4 text-right font-medium">2.800.000 ₫</td>
                <td className="py-4 text-right text-gray-600">—</td>
                <td className="py-4 text-center">
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] px-2 py-1 rounded-full">Thua</span>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-4 text-white font-medium">Giao Hữu Cuối Tuần</td>
                <td className="py-4 text-gray-400">22/05/2026</td>
                <td className="py-4">Thunder Bolt</td>
                <td className="py-4 text-right font-medium">1.500.000 ₫</td>
                <td className="py-4 text-right text-gray-600">—</td>
                <td className="py-4 text-center">
                  <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] px-2 py-1 rounded-full">Chờ TT</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default JockeyDashboard;