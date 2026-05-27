import React from "react";
import { 
  Zap,
  Trophy, 
  Map, 
  CircleDollarSign, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Flame,
  ChevronRight
} from "lucide-react";

const OwnerDashboard = () => {
  // Dữ liệu giả lập cho các thẻ thống kê (Stats)
  const stats = [
    { 
      label: "Tổng Số Ngựa", 
      value: "12", 
      sub: "+2 tháng này", 
      icon: <Zap className="text-indigo-400 w-6 h-6"/>, 
      color: "border-indigo-500/20 bg-indigo-500/5" 
    },
    { 
      label: "Đang Tham Gia", 
      value: "03", 
      sub: "2 đua đang diễn ra", 
      icon: <Map className="text-purple-400 w-6 h-6"/>, 
      color: "border-purple-500/20 bg-purple-500/5" 
    },
    { 
      label: "Chiến Thắng", 
      value: "27", 
      sub: "Tỉ lệ thắng 71%", 
      icon: <Trophy className="text-emerald-400 w-6 h-6"/>, 
      color: "border-emerald-500/20 bg-emerald-500/5" 
    },
    { 
      label: "Tổng Tiền Thưởng", 
      value: "₫ 84M", 
      sub: "+₫ 12M tháng này", 
      icon: <CircleDollarSign className="text-yellow-400 w-6 h-6"/>, 
      color: "border-yellow-500/20 bg-yellow-500/5" 
    },
  ];

  // Dữ liệu giả lập cho danh sách ngựa
  const horses = [
    { 
      name: "Thần Phong", 
      id: "TH-001", 
      breed: "Thoroughbred", 
      jockey: "Minh Hoàng", 
      status: "Thi Đấu", 
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      performance: "18W / 4L" 
    },
    { 
      name: "Bạch Long", 
      id: "BL-002", 
      breed: "Arabian", 
      jockey: "Phúc Thịnh", 
      status: "Sẵn Sàng", 
      statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      performance: "12W / 7L" 
    },
    { 
      name: "Hỏa Vân", 
      id: "HV-003", 
      breed: "Quarter Horse", 
      jockey: "Chưa gắn", 
      status: "Nghỉ Ngơi", 
      statusColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      performance: "9W / 5L" 
    },
    { 
      name: "Tốc Khải", 
      id: "TK-004", 
      breed: "Standardbred", 
      jockey: "Đức Long", 
      status: "Đang Đăng Ký", 
      statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      performance: "5W / 2L" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECTION: STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-[32px] border ${stat.color} flex justify-between items-start backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-default`}>
             <div>
                <p className="text-[10px] uppercase font-black text-gray-500 mb-1 tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">{stat.value}</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                   <Flame size={10} /> {stat.sub}
                </p>
             </div>
             <div className="p-3 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      {/* SECTION: HORSE LIST TABLE */}
      <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
         {/* Table Header Controls */}
         <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Danh Sách Ngựa</h3>
                <span className="bg-[#D9A520]/10 text-[#D9A520] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-[#D9A520]/20">
                  12 con ngựa
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
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-black/20 text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 border-b border-white/5">
                     <th className="px-8 py-5">Thông tin ngựa</th>
                     <th className="px-8 py-5">Giống loài</th>
                     <th className="px-8 py-5 text-center">Jockey Đảm Nhiệm</th>
                     <th className="px-8 py-5 text-center">Trạng Thái</th>
                     <th className="px-8 py-5 text-center">Thành Tích (W/L)</th>
                     <th className="px-8 py-5 text-right">Thao Tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {horses.map((horse, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                         <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D9A520] to-[#B8860B] flex items-center justify-center font-black text-black text-lg shadow-lg shadow-yellow-500/10 group-hover:scale-110 transition-transform">
                              {horse.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-sm text-white group-hover:text-[#D9A520] transition-colors">{horse.name}</p>
                               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">ID: #{horse.id}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-medium text-gray-400 italic">
                         {horse.breed}
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center justify-center space-x-2">
                           <div className="w-7 h-7 bg-gradient-to-tr from-indigo-600 to-blue-400 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-md">
                              {horse.jockey.charAt(0)}
                           </div>
                           <span className="text-xs text-gray-300 font-bold">{horse.jockey}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${horse.statusColor} tracking-tighter`}>
                            • {horse.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <div className="inline-flex items-center gap-2 text-xs font-black text-[#D9A520] tracking-widest bg-[#D9A520]/5 px-3 py-1 rounded-lg border border-[#D9A520]/10">
                            <Trophy size={14} className="opacity-70" />
                            {horse.performance}
                         </div>
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