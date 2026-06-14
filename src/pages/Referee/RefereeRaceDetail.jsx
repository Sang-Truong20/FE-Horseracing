import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Calendar, Trophy, Users } from "lucide-react";
import api from "../../config/axios";

const statusStyles = {
  Open: "bg-[#203A70] text-[#8DB7FF]",
  Closed: "bg-[#4B2C6F] text-[#D9A520]",
  Pending: "bg-[#3B3F65] text-[#A6B0FF]",
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

const RefereeRaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRace = async () => {
      try {
        const response = await api.get(`/api/referee/races/${id}`);
        if (response.data?.status === "Success") {
          setRace(response.data.data || null);
        } else {
          setError(response.data?.message || "Không thể tải chi tiết race.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi gọi API.");
      } finally {
        setLoading(false);
      }
    };

    fetchRace();
  }, [id]);

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition"
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      {loading ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Đang tải chi tiết cuộc đua...</div>
      ) : error ? (
        <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>
      ) : !race ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Race không tồn tại.</div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Chi tiết cuộc đua</p>
                <h1 className="text-3xl font-black text-white">{race.name}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                  <span className="inline-flex items-center gap-2"><MapPin size={16} /> {race.location}</span>
                  <span className="inline-flex items-center gap-2"><Clock size={16} /> {formatDate(race.raceDate)}</span>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[race.status] || "bg-white/5 text-gray-200"}`}>{race.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-200 sm:grid-cols-3">
                <div className="rounded-3xl bg-[#0F1322] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Cự ly</p>
                  <p className="mt-2 text-xl font-black text-white">{race.distanceM || "-"}m</p>
                </div>
                <div className="rounded-3xl bg-[#0F1322] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Giải thưởng</p>
                  <p className="mt-2 text-xl font-black text-white">{race.prizeMoney ? `₫ ${race.prizeMoney}` : "0"}</p>
                </div>
                <div className="rounded-3xl bg-[#0F1322] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Số đăng ký</p>
                  <p className="mt-2 text-xl font-black text-white">{race.registrations?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Danh sách đăng ký</p>
                <h2 className="mt-2 text-2xl font-black text-white">{race.registrations?.length || 0} lượt đăng ký</h2>
              </div>
              <div className="rounded-3xl bg-[#0F1322] px-4 py-3 text-sm text-gray-300">{race.prizeDistribution?.length || 0} bậc phân bổ</div>
            </div>

            <div className="space-y-4">
              {race.registrations?.length ? (
                race.registrations.map((registration) => (
                  <div key={registration._id} className="rounded-[28px] border border-white/10 bg-[#0A0D17] p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ngựa</p>
                        <p className="text-lg font-semibold text-white">{registration.horse?.name || "-"}</p>
                        <p className="text-sm text-gray-400">{registration.horse?.registrationNumber || "-"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Jockey</p>
                        <p className="text-lg font-semibold text-white">{registration.jockey?.fullName || "-"}</p>
                        <p className="text-sm text-gray-400">{registration.jockey?.licenseNumber || "-"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Owner</p>
                        <p className="text-lg font-semibold text-white">{registration.owner?.fullName || "-"}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 items-center text-sm text-gray-200">
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Trạng thái jockey: {registration.jockeyResponse?.status || "-"}</span>
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Phê duyệt: {registration.approvalStatus || "-"}</span>
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Payout: {registration.payoutDone ? "Đã trả" : "Chưa"}</span>
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Bonus: {registration.bonusPaid ? "Đã trả" : "Chưa"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-[#0A0D17] p-8 text-center text-gray-400">Không có đăng ký nào trong cuộc đua này.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereeRaceDetail;
