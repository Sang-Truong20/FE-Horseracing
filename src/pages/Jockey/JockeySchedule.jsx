import React from 'react';
import { Calendar, Flag, Clock, MapPin, Search, ChevronRight, Activity } from 'lucide-react';

const scheduleItems = [
  {
    raceName: 'Sprint Showdown 1200m',
    raceDate: '2026-07-15T08:00:00.000Z',
    venue: 'Trường đua Phú Thọ',
    horse: 'Thunderbolt2',
    status: 'Chờ xác nhận',
  },
  {
    raceName: 'Stayer Cup 2400m',
    raceDate: '2026-09-10T07:30:00.000Z',
    venue: 'Trường đua Bình Dương',
    horse: 'Sang',
    status: 'Đã nhận',
  },
  {
    raceName: 'Midnight Challenge',
    raceDate: '2026-10-22T20:00:00.000Z',
    venue: 'Trường đua Long An',
    horse: 'Silver Wind',
    status: 'Đang chờ',
  },
];

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const JockeySchedule = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-[#EBCB75] rounded-full"></div>
          <h1 className="text-3xl font-bold text-white">Lịch Đua</h1>
        </div>
        <p className="text-gray-400 text-sm">Xem lịch đua sắp tới và theo dõi phân công ngựa của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
          <p className="text-sm text-gray-400">Lịch đua sắp tới</p>
          <h2 className="text-3xl font-bold text-white">{scheduleItems.length}</h2>
        </div>
        <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
          <p className="text-sm text-gray-400">Ngựa dự kiến</p>
          <h2 className="text-3xl font-bold text-white">3</h2>
        </div>
        <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
          <p className="text-sm text-gray-400">Số trường đua</p>
          <h2 className="text-3xl font-bold text-white">3</h2>
        </div>
      </div>

      <div className="bg-[#1C152B] rounded-3xl border border-white/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Lịch trình chi tiết</h2>
            <p className="text-gray-400 text-sm">Theo dõi mỗi cuộc đua và trạng thái phân công của bạn.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#150F22] border border-white/10 p-2">
            <Search className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc đua..."
              className="bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {scheduleItems.map((item, idx) => (
            <div key={idx} className="rounded-3xl border border-white/5 bg-[#15131f] p-5 shadow-sm transition hover:border-[#EBCB75]/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{item.status}</p>
                  <h3 className="text-2xl font-bold text-white">{item.raceName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Ngày giờ</p>
                  <p className="text-white font-semibold">{formatDateTime(item.raceDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="rounded-2xl bg-[#1c172c] p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Calendar size={16} /> Địa điểm
                  </div>
                  <p className="font-semibold text-white">{item.venue}</p>
                </div>
                <div className="rounded-2xl bg-[#1c172c] p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Flag size={16} /> Ngựa
                  </div>
                  <p className="font-semibold text-white">{item.horse}</p>
                </div>
                <div className="rounded-2xl bg-[#1c172c] p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Clock size={16} /> Trạng thái
                  </div>
                  <p className="font-semibold text-white">{item.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JockeySchedule;
