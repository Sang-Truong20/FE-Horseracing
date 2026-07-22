import React, { useEffect, useState } from "react";
import { Calendar, Flag, MapPin, Trophy } from "lucide-react";
import api from "../../config/axios";

const emptyBuckets = {
  counts: { upcoming: 0, inProgress: 0, finished: 0, cancelled: 0 },
  upcoming: [],
  inProgress: [],
  finished: [],
  cancelled: [],
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const JockeySchedule = () => {
  const [buckets, setBuckets] = useState(emptyBuckets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/jockey/races");
        if (response.data?.status === "Success") {
          const data = response.data.data || {};
          setBuckets({
            counts: { ...emptyBuckets.counts, ...(data.counts || {}) },
            upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
            inProgress: Array.isArray(data.inProgress) ? data.inProgress : [],
            finished: Array.isArray(data.finished) ? data.finished : [],
            cancelled: Array.isArray(data.cancelled) ? data.cancelled : [],
          });
        } else {
          setError(response.data?.message || "Không thể tải danh sách cuộc đua.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải danh sách cuộc đua.");
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  const renderRace = (race) => (
    <div key={`${race.raceId}-${race.horse?._id}`} className="rounded-3xl border border-white/5 bg-[#15131f] p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{race.status || "-"}</p>
          <h3 className="mt-2 text-xl font-bold text-white">{race.raceName || "Cuộc đua"}</h3>
          <p className="mt-2 text-sm text-gray-400">{formatDateTime(race.raceDate)}</p>
        </div>
        <span className="rounded-full bg-[#EBCB75]/10 px-3 py-1 text-xs font-bold text-[#EBCB75]">Jockey: {race.jockeyResponse || "-"}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="rounded-2xl border border-white/5 bg-[#1C152B] p-3"><p className="text-xs text-gray-500">Ngựa</p><p className="mt-1 font-semibold text-white">{race.horse?.name || "-"}</p></div>
        <div className="rounded-2xl border border-white/5 bg-[#1C152B] p-3"><p className="text-xs text-gray-500">Chủ ngựa</p><p className="mt-1 font-semibold text-white">{race.owner?.stableName || race.owner?.fullName || "-"}</p></div>
        <div className="rounded-2xl border border-white/5 bg-[#1C152B] p-3"><p className="text-xs text-gray-500">Địa điểm / cự ly</p><p className="mt-1 font-semibold text-white">{race.location || "-"} · {race.distanceM ? `${race.distanceM}m` : "-"}</p></div>
        <div className="rounded-2xl border border-white/5 bg-[#1C152B] p-3"><p className="text-xs text-gray-500">Kết quả</p><p className="mt-1 font-semibold text-[#EBCB75]">Hạng {race.finalRank ?? "-"} · {race.finishTimeSec != null ? `${race.finishTimeSec}s` : "-"}</p></div>
      </div>
    </div>
  );

  const renderBucket = (title, items) => (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-white">{title} <span className="text-sm text-gray-500">({items.length})</span></h2>
      {items.length ? items.map(renderRace) : <div className="rounded-2xl border border-white/5 bg-[#1C152B] p-5 text-sm text-gray-500">Chưa có cuộc đua.</div>}
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div>
        <div className="mb-1 flex items-center gap-3"><div className="h-6 w-1 rounded-full bg-[#EBCB75]" /><h1 className="text-3xl font-bold text-white">Cuộc đua</h1></div>
        <p className="text-sm text-gray-400">Các giải đấu mà bạn đã đăng ký cưỡi ngựa.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["Sắp đua", "upcoming", Calendar], ["Đang đua", "inProgress", Flag], ["Đã đua", "finished", Trophy], ["Đã hủy", "cancelled", MapPin]].map(([label, key, Icon]) => (
          <div key={key} className="rounded-2xl border border-white/5 bg-[#1C152B] p-4"><Icon size={18} className="text-[#EBCB75]" /><p className="mt-3 text-2xl font-black text-white">{buckets.counts[key] ?? buckets[key].length}</p><p className="text-xs text-gray-500">{label}</p></div>
        ))}
      </div>
      {loading ? <div className="rounded-3xl bg-[#1C152B] p-10 text-center text-gray-400">Đang tải cuộc đua...</div> : error ? <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">{error}</div> : <div className="grid gap-6 xl:grid-cols-2">{renderBucket("Sắp đua", buckets.upcoming)}{renderBucket("Đang đua", buckets.inProgress)}{renderBucket("Đã đua", buckets.finished)}{renderBucket("Đã hủy", buckets.cancelled)}</div>}
    </div>
  );
};

export default JockeySchedule;
