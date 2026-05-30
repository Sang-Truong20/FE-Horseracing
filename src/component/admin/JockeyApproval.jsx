import React from "react";
import { Check, X, Search } from "lucide-react";

const JockeyApproval = () => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const pendingJockeys = [
    {
      id: 1,
      name: "Văn Khải",
      experience: "3 năm kinh nghiệm",
      status: "pending",
      date: "2024-03-15",
    },
    {
      id: 2,
      name: "Hoàng Tú",
      experience: "5 năm kinh nghiệm",
      status: "pending",
      date: "2024-03-16",
    },
    {
      id: 3,
      name: "Quang Lâm",
      experience: "2 năm kinh nghiệm",
      status: "pending",
      date: "2024-03-17",
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Cấp Phép Jockey</h2>
        <div className="text-sm text-gray-400">7 yêu cầu chờ duyệt</div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm jockey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Jockey List */}
      <div className="space-y-3">
        {pendingJockeys.map((jockey) => (
          <div
            key={jockey.id}
            className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500 transition"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                {jockey.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold">{jockey.name}</p>
                <p className="text-sm text-gray-400">{jockey.experience}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition font-medium flex items-center space-x-2">
                <Check size={18} />
                <span>Duyệt</span>
              </button>
              <button className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition font-medium flex items-center space-x-2">
                <X size={18} />
                <span>Từ Chối</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-6 text-center">
        <a
          href="/admin/jockeys"
          className="text-purple-400 hover:text-purple-300 font-medium text-sm"
        >
          Xem tất cả 7 yêu cầu →
        </a>
      </div>
    </div>
  );
};

export default JockeyApproval;
