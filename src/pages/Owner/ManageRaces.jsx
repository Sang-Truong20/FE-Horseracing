import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { ChevronRight } from "lucide-react";

const ManageRaces = () => {
  const [races, setRaces] = useState([]);
  const [status, setStatus] = useState("Open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRaces = async (s) => {
    setLoading(true);
    setError(null);
    try {
      const params = s && s !== "All" ? { status: s } : {};
      const res = await api.get("/api/owner/races", { params });
      if (res.data?.status === "Success") {
        setRaces(res.data.data || []);
      } else {
        setError(res.data?.message || "Không lấy được danh sách cuộc đua");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces(status);
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Đăng Ký Vào Cuộc Đua</h2>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-black/60 border border-white/10 text-sm rounded-xl px-3 py-2 text-white"
          >
            <option value="All">All</option>
            <option value="Draft">Draft</option>
            <option value="Open">Open</option>
            <option value="Locked">Locked</option>
            <option value="Finished">Finished</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0D1117] rounded-[20px] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Đang tải cuộc đua...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-[10px] uppercase text-gray-600 border-b border-white/5">
                  <th className="px-6 py-3">Tên cuộc đua</th>
                  <th className="px-6 py-3">Ngày giờ</th>
                  <th className="px-6 py-3">Địa điểm</th>
                  <th className="px-6 py-3">Khoảng cách (m)</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Tiền thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {races.map((race) => (
                  <tr key={race._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{race.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{new Date(race.raceDate).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{race.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{race.distanceM}</td>
                    <td className="px-6 py-4 text-sm font-black uppercase text-[#D9A520]">{race.status}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-[#D9A520]">{race.prizeMoney?.toLocaleString() || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRaces;
