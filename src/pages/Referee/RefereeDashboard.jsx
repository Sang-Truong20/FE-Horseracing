import React from "react";
import { ArrowRight, Calendar, Flag, MapPin, Clock, CheckCircle2, Users, MoreHorizontal } from "lucide-react";

const refereeRaces = [
  {
    id: "RRC-2025-001",
    name: "Giải Thần Phong Mùa Hè",
    venue: "Trường Phú Thọ",
    time: "Hôm nay 14:30 - 17:00",
    status: "Đang Diễn Ra",
    jockeys: "12 / 14",
    tag: "Đang Diễn Ra",
  },
  {
    id: "RRC-2025-002",
    name: "Cúp Bạch Long Mùa Thu",
    venue: "Trường Đại Nam",
    time: "Hôm nay 19:00 - 21:30",
    status: "Sắp Bắt Đầu",
    jockeys: "8 / 10",
    tag: "Sắp Bắt Đầu",
  },
  {
    id: "RRC-2025-003",
    name: "Giải Hòa Vân Mùa Đông",
    venue: "Trường Bình Dương",
    time: "Ngày mai 09:00 - 12:00",
    status: "Chờ Xác Nhận",
    jockeys: "5 / 12",
    tag: "Chờ Xác Nhận",
  },
];

const statusStyles = {
  "Đang Diễn Ra": "bg-[#1D3D6D]/80 text-[#7DB7FF]",
  "Sắp Bắt Đầu": "bg-[#4F3250]/80 text-[#D9A520]",
  "Chờ Xác Nhận": "bg-[#3F2B4F]/80 text-[#8E88B7]",
};

const RefereeDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Cuộc Đua Được Giao</p>
          <p className="mt-4 text-4xl font-black text-white">3</p>
          <p className="mt-3 text-sm text-gray-400">Cuộc đua đang trong quyền quản lý của bạn.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Jockey Chờ Duyệt</p>
          <p className="mt-4 text-4xl font-black text-white">9</p>
          <p className="mt-3 text-sm text-gray-400">Đang chờ xác nhận đăng ký jockey.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Kết Quả Đã Nhập</p>
          <p className="mt-4 text-4xl font-black text-white">18</p>
          <p className="mt-3 text-sm text-gray-400">Số kết quả cuộc đua đã báo cáo.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Tổng Tiền Đã Chia</p>
          <p className="mt-4 text-4xl font-black text-white">1.2B</p>
          <p className="mt-3 text-sm text-gray-400">Tổng giá trị đã phân chia cho người thắng.</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
        <div className="flex flex-col gap-4 lg:items-center lg:flex-row lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Danh Sách Cuộc Đua Được Giao</p>
            <h3 className="mt-2 text-2xl font-black text-white">3 cuộc đua</h3>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button className="rounded-2xl bg-[#2E3D72] px-4 py-3 text-white transition hover:bg-[#4253A1]">Tất Cả</button>
            <button className="rounded-2xl bg-white/5 px-4 py-3 text-gray-300 transition hover:bg-white/10">Hôm Nay</button>
            <button className="rounded-2xl bg-white/5 px-4 py-3 text-gray-300 transition hover:bg-white/10">Đã Xong</button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-[#090B15]">
          <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.25em] text-gray-500">
            <span className="col-span-4">Cuộc Đua</span>
            <span className="col-span-2">Địa Điểm</span>
            <span className="col-span-2">Thời Gian</span>
            <span className="col-span-2">Trạng Thái</span>
            <span className="col-span-1">Jockey ĐK</span>
            <span className="col-span-1 text-right">Thao Tác</span>
          </div>
          {refereeRaces.map((race) => (
            <div key={race.id} className="grid grid-cols-12 gap-4 border-b border-white/5 px-6 py-5 last:border-b-0 hover:bg-white/5 transition-all">
              <div className="col-span-4 space-y-2">
                <p className="text-sm font-semibold text-white">{race.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                  <Flag size={14} /> {race.id}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-sm text-gray-300"><MapPin size={16} /> {race.venue}</div>
              <div className="col-span-2 flex items-center gap-2 text-sm text-gray-300"><Clock size={16} /> {race.time}</div>
              <div className="col-span-2 flex items-center gap-2">
                <span className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusStyles[race.status] || "bg-white/5 text-gray-200"}`}>{race.tag}</span>
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm text-gray-300">{race.jockeys}</div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <button className="rounded-2xl bg-[#D9A520] px-3 py-2 text-xs font-black uppercase text-black hover:bg-[#f2cb46] transition">Xem</button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition"><MoreHorizontal size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RefereeDashboard;
