import React, { useState } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const UserList = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const users = [
    {
      id: 1,
      name: "Nguyễn Tuấn",
      email: "nguyen.tuan@gmail.com",
      role: "Owner",
      status: "Hoạt Động",
      balance: "42,500,000",
      date: "12/03/2024",
    },
    {
      id: 2,
      name: "Trần Minh Hoàng",
      email: "tran.minh.hoang@gmail.com",
      role: "Jockey",
      status: "Hoạt Động",
      balance: "8,200,000",
      date: "28/01/2024",
    },
    {
      id: 3,
      name: "Lê Thị Phương",
      email: "le.thi.phuong@gmail.com",
      role: "Owner",
      status: "Chờ Xác Minh",
      balance: "0",
      date: "05/06/2024",
    },
    {
      id: 4,
      name: "Phạm Đức Việt",
      email: "pham.duc.viet@gmail.com",
      role: "Owner",
      status: "Bị Khóa",
      balance: "1,500,000",
      date: "18/09/2023",
    },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      Owner: "bg-purple-500/20 text-purple-300",
      Jockey: "bg-blue-500/20 text-blue-300",
      Admin: "bg-red-500/20 text-red-300",
    };
    return badges[role] || "bg-gray-500/20 text-gray-300";
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Hoạt Động": "bg-green-500/20 text-green-300",
      "Chờ Xác Minh": "bg-yellow-500/20 text-yellow-300",
      "Bị Khóa": "bg-red-500/20 text-red-300",
    };
    return badges[status] || "bg-gray-500/20 text-gray-300";
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">Danh Sách Người Dùng</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                NGƯỜI DÙNG
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                VAI TRÒ
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                TRẠNG THÁI
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                NGÀY THAM GIA
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                SỐ DƯ VÍ
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {user.date}
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  ₫{user.balance}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition text-blue-400">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition text-yellow-400">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Hiển thị 4 / 1284 người dùng
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentPage === page
                    ? "bg-purple-500 text-white"
                    : "hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserList;
