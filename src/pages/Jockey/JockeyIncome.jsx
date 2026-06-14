import React from 'react';
import { Wallet, Award, Activity, Calendar, TrendingUp, ChevronRight } from 'lucide-react';

const incomeItems = [
  {
    label: 'Thu nhập tháng',
    amount: 12450000,
    detail: 'Tổng tiền thuê và thưởng tháng này',
    icon: Wallet,
    color: 'emerald',
  },
  {
    label: 'Thưởng hiện có',
    amount: 8000000,
    detail: 'Tiền thưởng từ kết quả cạnh tranh',
    icon: Award,
    color: 'yellow',
  },
  {
    label: 'Lợi nhuận ròng',
    amount: 4450000,
    detail: 'Sau khi trừ chi phí và phí dịch vụ',
    icon: TrendingUp,
    color: 'blue',
  },
];

const transactions = [
  { event: 'Sprint Showdown 1200m', date: '15/07/2026', horse: 'Thunderbolt2', hire: 3000000, bonus: 0, status: 'Chờ TT' },
  { event: 'Stayer Cup 2400m', date: '10/09/2026', horse: 'Sang', hire: 0, bonus: 0, status: 'Chấp nhận' },
  { event: 'City Derby', date: '20/06/2026', horse: 'Thunderbolt2', hire: 3500000, bonus: 8000000, status: 'Thắng' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const JockeyIncome = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-[#EBCB75] rounded-full"></div>
          <h1 className="text-3xl font-bold text-white">Thu nhập & Thưởng</h1>
        </div>
        <p className="text-gray-400 text-sm">Theo dõi thu nhập, thưởng và lịch sử thanh toán của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {incomeItems.map((item) => {
          const Icon = item.icon;
          const bgClass = item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-300' : item.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-300' : 'bg-blue-500/10 text-blue-300';
          return (
            <div key={item.label} className="rounded-3xl border border-white/5 bg-[#1C152B] p-5">
              <div className={`inline-flex items-center justify-center rounded-2xl p-3 ${bgClass}`}>
                <Icon size={20} />
              </div>
              <p className="mt-4 text-sm text-gray-400">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(item.amount)}</p>
              <p className="mt-3 text-sm text-gray-500">{item.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1C152B] rounded-3xl border border-white/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Lịch sử thanh toán</h2>
            <p className="text-gray-400 text-sm">Các khoản thu nhập và thưởng gần đây.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#150F22] border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition">
            <Calendar size={16} /> Thống kê tháng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="pb-3 font-medium">Sự kiện</th>
                <th className="pb-3 font-medium">Ngày</th>
                <th className="pb-3 font-medium">Ngựa</th>
                <th className="pb-3 font-medium text-right">Tiền thuê</th>
                <th className="pb-3 font-medium text-right">Tiền thưởng</th>
                <th className="pb-3 font-medium text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {transactions.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 text-white font-medium">{row.event}</td>
                  <td className="py-4 text-gray-400">{row.date}</td>
                  <td className="py-4">{row.horse}</td>
                  <td className="py-4 text-right font-medium">{formatCurrency(row.hire)}</td>
                  <td className="py-4 text-right font-medium text-emerald-400">{row.bonus > 0 ? formatCurrency(row.bonus) : '—'}</td>
                  <td className="py-4 text-center">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${
                      row.status === 'Thắng' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : row.status === 'Chấp nhận' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JockeyIncome;
