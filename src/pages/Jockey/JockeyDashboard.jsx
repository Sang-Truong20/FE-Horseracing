import React from "react";

const JockeyDashboard = () => (
  <div className="mx-auto max-w-7xl space-y-6">
    <div>
      <div className="mb-1 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-[#EBCB75]" />
        <h1 className="text-2xl font-bold text-white">Tổng quan Jockey</h1>
      </div>
      <p className="text-sm text-gray-400">Thông tin tổng quan sẽ được hiển thị khi hệ thống có dữ liệu từ API.</p>
    </div>
    <div className="rounded-2xl border border-white/5 bg-[#1C152B] p-8 text-center text-sm text-gray-400">
      Chưa có dữ liệu tổng quan.
    </div>
  </div>
);

export default JockeyDashboard;
