import React, { useEffect, useState } from "react";
import { Alert, Spin } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";

const AdminReferees = () => {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReferees = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const response = await api.get("/api/admin/referees", { params });
      if (response.data?.status === "Success") {
        setReferees(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setError(response.data?.message || "Không thể tải danh sách trọng tài.");
        setReferees([]);
      }
    } catch (err) {
      console.error("Fetch referees error:", err);
      setError(err.response?.data?.message || "Lỗi khi tải danh sách trọng tài.");
      setReferees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản Lý Trọng Tài - Thunder";
    fetchReferees();
  }, [statusFilter]);

  const filteredReferees = referees;

  const getStatusBadge = (status) => {
    const map = {
      Active: "bg-green-500/20 text-green-300",
      Inactive: "bg-gray-500/20 text-gray-300",
      Banned: "bg-red-500/20 text-red-300",
      Pending: "bg-yellow-500/20 text-yellow-300",
    };
    return map[status] || "bg-gray-500/20 text-gray-300";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản Lý Trọng Tài</h1>
          <p className="text-gray-400 mt-2">Danh sách trọng tài và thống kê hoạt động.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
            </select>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Tổng số trọng tài</p>
            <p className="mt-1 text-3xl font-bold text-white">{referees.length}</p>
          </div>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="rounded-lg border-gray-700 bg-gray-800 text-white"
          />
        )}

        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-700 p-6">
            <div>
              <h2 className="text-xl font-bold">Danh sách trọng tài</h2>
              <p className="text-sm text-gray-400">{filteredReferees.length} trọng tài được hiển thị</p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              <Spin /> Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                  <tr>
                    <th className="px-6 py-4">USERNAME</th>
                    <th className="px-6 py-4">HỌ TÊN</th>
                    <th className="px-6 py-4">EMAIL</th>
                    <th className="px-6 py-4">CERT</th>
                    <th className="px-6 py-4">CHUYÊN MÔN</th>
                    <th className="px-6 py-4">SỐ RACE</th>
                    <th className="px-6 py-4">ACTIVE</th>
                    <th className="px-6 py-4">TRẠNG THÁI</th>
                    <th className="px-6 py-4">ĐĂNG NHẬP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredReferees.length > 0 ? (
                    filteredReferees.map((referee) => (
                      <tr key={referee._id} className="hover:bg-gray-700/40 transition">
                        <td className="px-6 py-4 text-sm text-white">{referee.username || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.fullName || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.email || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.refereeCertNumber || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.specialization || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.totalRacesOfficiated ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.activeRaceCount ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(referee.status)}`}>
                            {referee.status || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-200">{referee.lastLoginAt ? new Date(referee.lastLoginAt).toLocaleString("vi-VN") : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-10 text-center text-gray-400">
                        Không có trọng tài để hiển thị.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReferees;
