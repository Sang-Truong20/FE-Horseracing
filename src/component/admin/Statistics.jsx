import React from "react";
import { Users, Award, TrendingUp, Wallet } from "lucide-react";

const Statistics = ({ stats }) => {
  const statItems = [
    {
      title: "Tổng Người Dùng",
      value: stats?.totalUsers || 1284,
      change: "+48 hôm nay",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Owner Đã Xác Minh",
      value: stats?.verifiedOwners || 392,
      change: "Tăng 30.5%",
      icon: Award,
      color: "bg-yellow-500",
    },
    {
      title: "Jockey Chờ Cấp Phép",
      value: stats?.pendingJockeys || 7,
      change: "Cần xử lý ngay",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
    {
      title: "Yêu Cầu Rút Tiền",
      value: stats?.withdrawRequests || 248,
      change: "5 yêu cầu chờ",
      icon: Wallet,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">{item.title}</h3>
              <div className={`${item.color} p-3 rounded-lg`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold">{item.value.toLocaleString()}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">{item.change}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Statistics;
