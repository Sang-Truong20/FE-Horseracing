import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../config/axios";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/admin/users");
      const payload = response.data?.data ?? response.data ?? [];
      const resolvedUsers = Array.isArray(payload)
        ? payload
        : payload.users ?? payload.items ?? [];
      setUsers(resolvedUsers);
    } catch (fetchError) {
      console.error("Fetch users error:", fetchError);
      setError("Không thể tải danh sách người dùng.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Danh Sách Người Dùng</h2>
            <p className="text-sm text-gray-400">{users.length} người dùng</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400">Đang tải dữ liệu người dùng...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-400">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGƯỜI DÙNG</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">VAI TRÒ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRẠNG THÁI</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGÀY THAM GIA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">SỐ DƯ VÍ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white">
                            {user.name?.split(" ").map((n) => n[0]).join("")}
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
                      <td className="px-6 py-4 text-sm text-gray-400">{user.createdAt ?? user.date ?? "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold">₫{user.balance ?? 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button className="p-2 hover:bg-gray-600 rounded-lg transition text-blue-400" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 hover:bg-gray-600 rounded-lg transition text-yellow-400" title="Chỉnh sửa">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 hover:bg-gray-600 rounded-lg transition text-red-400" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      Không có người dùng để hiển thị
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Hiển thị {users.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, users.length)} / {users.length} người dùng
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      currentPage === index + 1 ? "bg-purple-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                {totalPages > 5 && <span className="text-gray-400">...</span>}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserList;
