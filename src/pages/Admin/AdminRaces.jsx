import React, { useEffect, useState } from "react";
import { Alert, Spin } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";

const ADMIN_RACES_API = "/api/owner/races";

const formatCurrency = (value) => `₫${Number(value ?? 0).toLocaleString("vi-VN")}`;

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
};

const getStatusBadge = (status) => {
  const badges = {
    Open: "bg-emerald-500/20 text-emerald-300",
    Closed: "bg-red-500/20 text-red-300",
    Pending: "bg-yellow-500/20 text-yellow-300",
    Ongoing: "bg-blue-500/20 text-blue-300",
    Completed: "bg-purple-500/20 text-purple-300",
    Cancelled: "bg-gray-500/20 text-gray-300",
  };

  return badges[status] || "bg-gray-500/20 text-gray-300";
};

const AdminRaces = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(ADMIN_RACES_API);
      const payload = response.data?.data ?? [];
      const resolvedRaces = Array.isArray(payload) ? payload : [];
      setRaces(resolvedRaces);
    } catch (fetchError) {
      console.error("Fetch races error:", fetchError);
      setError("Không thể tải danh sách cuộc đua. Vui lòng thử lại.");
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản Lý Cuộc Đua - Thunder";
    fetchRaces();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản Lý Cuộc Đua</h1>
          <p className="mt-2 text-gray-400">Danh sách toàn bộ race trong hệ thống</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="border-gray-700 bg-gray-800 text-white"
          />
        )}

        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-700 p-6">
            <div>
              <h2 className="text-xl font-bold">Danh Sách Cuộc Đua</h2>
              <p className="text-sm text-gray-400">{races.length} cuộc đua</p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              <Spin /> Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700 bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">CUỘC ĐUA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGÀY ĐUA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ĐỊA ĐIỂM</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">CỰ LY</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRỌNG TÀI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ĐĂNG KÝ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">PHÍ THAM GIA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">GIẢI THƯỞNG</th>
                  </tr>
                </thead>
                <tbody>
                  {races.length > 0 ? (
                    races.map((race) => (
                      <tr key={race._id} className="border-b border-gray-700 transition hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{race.name || "-"}</p>
                            <p className="text-xs text-gray-500">ID: {race._id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(race.raceDate)}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.location || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.distanceM ?? 0} m</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(race.status)}`}>
                            {race.status || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p>{race.referee?.fullName || "-"}</p>
                            <p className="text-xs text-gray-500">{race.referee?.email || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.registrations?.length ?? 0}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{formatCurrency(race.entryFee)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{formatCurrency(race.prizeMoney)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                        Không có cuộc đua để hiển thị
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

export default AdminRaces;
