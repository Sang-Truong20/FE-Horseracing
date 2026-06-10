import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Flag, MapPin, Clock, Users, MoreHorizontal } from "lucide-react";
import api from "../../config/axios";

const statusStyles = {
  Open: "bg-[#203A70] text-[#8DB7FF]",
  Closed: "bg-[#4B2C6F] text-[#D9A520]",
  Pending: "bg-[#2F4A2C] text-[#7DE8B4]",
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RefereeDashboard = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await api.get("/api/referee/races");
        if (response.data?.status === "Success") {
          setRaces(response.data.data || []);
        } else {
          setError(response.data?.message || "Không thể tải danh sách cuộc đua.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi gọi API.");
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Danh Sách Cuộc Đua Được Giao</p>
          <h3 className="text-2xl font-black text-white">{races.length} cuộc đua</h3>
          <p className="text-sm text-gray-400">Hiển thị các race bạn được phân công làm referee.</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>
      ) : races.length === 0 ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Không có cuộc đua nào được giao.</div>
      ) : (
        <div className="space-y-8">
          {races.map((race) => (
            <div key={race._id} className="rounded-[32px] border border-white/10 bg-[#090B15] p-6 shadow-[0_30px_80px_rgba(9,11,21,0.25)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center text-xs uppercase tracking-[0.35em] text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Flag size={14} /> Race referee
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">{formatDate(race.raceDate)}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{race.name}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                    <span className="inline-flex items-center gap-2"><MapPin size={16} /> {race.location}</span>
                    <span className="inline-flex items-center gap-2"><Calendar size={16} /> {race.distanceM}m</span>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[race.status] || "bg-white/5 text-gray-200"}`}>{race.status}</span>
                  </div>
                </div>
                <button onClick={() => navigate(`/referee/${race._id}`)} className="rounded-3xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-[#f2cb46]">Chi tiết</button>
              </div>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#0F1322]">
                <div className="grid grid-cols-6 gap-4 border-b border-white/10 px-5 py-4 text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  <span className="col-span-2">Ngựa / Jockey</span>
                  <span className="col-span-1">Giấy phép</span>
                  <span className="col-span-1">Chủ xe</span>
                  <span className="col-span-1">Trạng thái jockey</span>
                  <span className="col-span-1">Phê duyệt</span>
                </div>
                {race.registrations?.length ? (
                  race.registrations.map((registration) => (
                    <div key={registration._id} className="grid grid-cols-6 gap-4 border-b border-white/5 px-5 py-5 last:border-b-0 text-sm text-gray-200">
                      <div className="col-span-2 space-y-1">
                        <p className="font-semibold text-white">{registration.horse?.name || "-"}</p>
                        <p className="text-xs text-gray-500">{registration.horse?.registrationNumber || "-"}</p>
                        <p className="mt-2 text-xs text-gray-400">{registration.horse?.name ? registration.horse?.name : ""}</p>
                      </div>
                      <div className="col-span-1 space-y-1">
                        <p className="font-semibold text-white">{registration.jockey?.fullName || "-"}</p>
                        <p className="text-xs text-gray-500">{registration.jockey?.licenseNumber || "-"}</p>
                      </div>
                      <div className="col-span-1 text-sm text-gray-200">{registration.owner?.fullName || "-"}</div>
                      <div className="col-span-1">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${registration.jockeyResponse?.status === "Pending" ? "bg-[#3B3F65] text-[#A6B0FF]" : "bg-[#203A70] text-[#8DB7FF]"}`}>
                          {registration.jockeyResponse?.status || "-"}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${registration.approvalStatus === "Pending" ? "bg-[#3B3F65] text-[#A6B0FF]" : registration.approvalStatus === "Approved" ? "bg-[#1F4B2C] text-[#7DE8B4]" : "bg-[#4B2C2C] text-[#FF9C8A]"}`}>
                          {registration.approvalStatus || "-"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center text-gray-400">Không có đăng ký nào.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefereeDashboard;
