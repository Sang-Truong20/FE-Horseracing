import React, { useEffect, useState } from "react";
import { Calendar, Flag, MapPin, Clock, MoreHorizontal, X } from "lucide-react";
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

const normalizeRaces = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.races)) return payload.races;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object") return [payload];
  return [];
};

const RefereeDashboard = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [showRaceModal, setShowRaceModal] = useState(false);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await api.get("/api/referee/races");
        if (response.data?.status === "Success") {
          setRaces(normalizeRaces(response.data.data));
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
                <button onClick={() => { setSelectedRace(race); setShowRaceModal(true); }} className="rounded-3xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-[#f2cb46]">Chi tiết</button>
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
      {showRaceModal && selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-5xl rounded-[32px] bg-[#0B101A] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white">{selectedRace.name}</h2>
                <p className="text-sm text-gray-400">{formatDate(selectedRace.raceDate)} • {selectedRace.location}</p>
              </div>
              <button onClick={() => setShowRaceModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl bg-[#111827] p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Trạng thái</p>
                  <p className={`mt-3 inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold ${statusStyles[selectedRace.status] || "bg-white/5 text-gray-200"}`}>{selectedRace.status}</p>
                </div>
                <div className="rounded-3xl bg-[#111827] p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Khoảng cách</p>
                  <p className="mt-3 text-2xl font-black text-white">{selectedRace.distanceM || "-"}m</p>
                </div>
                <div className="rounded-3xl bg-[#111827] p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Giải thưởng</p>
                  <p className="mt-3 text-2xl font-black text-white">{selectedRace.prizeMoney ? `₫ ${selectedRace.prizeMoney}` : "0"}</p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-[#111827] p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Địa điểm</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selectedRace.location || "-"}</p>
                </div>
                <div className="rounded-3xl bg-[#111827] p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Phân bổ thưởng</p>
                  <div className="mt-3 space-y-2">
                    {selectedRace.prizeDistribution?.length ? (
                      selectedRace.prizeDistribution.map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-2xl bg-[#0F1322] px-4 py-3 text-sm text-gray-200">
                          <span>Hạng {item.rank}</span>
                          <span>{item.percent}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Không có dữ liệu phân bổ.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-[#0F1322] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Danh sách đăng ký</p>
                    <h3 className="mt-2 text-2xl font-black text-white">{selectedRace.registrations?.length || 0} đăng ký</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedRace.registrations?.length ? (
                    selectedRace.registrations.map((registration) => (
                      <div key={registration._id} className="rounded-3xl border border-white/10 bg-[#111827] p-5">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ngựa</p>
                            <p className="font-semibold text-white">{registration.horse?.name || "-"}</p>
                            <p className="text-sm text-gray-400">{registration.horse?.registrationNumber || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Jockey</p>
                            <p className="font-semibold text-white">{registration.jockey?.fullName || "-"}</p>
                            <p className="text-sm text-gray-400">{registration.jockey?.licenseNumber || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Trạng thái</p>
                            <p className="inline-flex rounded-full bg-[#141B2F] px-3 py-2 text-sm font-semibold text-gray-200">{registration.jockeyResponse?.status || "-"}</p>
                            <p className="text-sm text-gray-400">Phê duyệt: {registration.approvalStatus || "-"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Không có đăng ký nào trong cuộc đua này.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereeDashboard;
