import React from "react";

const JockeyIncome = () => (
  <div className="mx-auto max-w-7xl space-y-6 pb-10">
    <div>
      <div className="mb-1 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-[#EBCB75]" />
        <h1 className="text-3xl font-bold text-white">Thu nhập & Thưởng</h1>
      </div>
      <p className="text-sm text-gray-400">Chỉ hiển thị các khoản thu nhập và thưởng được trả về từ API.</p>
    </div>
    <div className="rounded-3xl border border-white/5 bg-[#1C152B] p-8 text-center text-sm text-gray-400">
      Chưa có dữ liệu thu nhập hoặc thưởng.
    </div>
  </div>
);

export default JockeyIncome;
