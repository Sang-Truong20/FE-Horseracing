import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Flag, MapPin, X, Users, Trophy, RefreshCw, XCircle } from "lucide-react";
import api from "../../config/axios";

const statusStyles = {
  Draft: "bg-white/5 text-gray-300",
  Open: "bg-[#203A70] text-[#8DB7FF]",
  Locked: "bg-[#4B2C6F] text-[#D9A520]",
  Finished: "bg-[#1F4B2C] text-[#7DE8B4]",
  Cancelled: "bg-[#4B2C2C] text-[#FF9C8A]",
};

const statusOptions = ["Tất cả", "Draft", "Open", "Locked", "Finished", "Cancelled"];

const emptyBuckets = {
  counts: { upcoming: 0, inProgress: 0, finished: 0, cancelled: 0 },
  upcoming: [],
  inProgress: [],
  finished: [],
  cancelled: [],
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.races)) return payload.races;
  if (Array.isArray(payload?.registrations)) return payload.registrations;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object" && payload._id) return [payload];
  return [];
};

const normalizeBuckets = (payload) => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const next = {
      counts: payload.counts || emptyBuckets.counts,
      upcoming: Array.isArray(payload.upcoming) ? payload.upcoming : [],
      inProgress: Array.isArray(payload.inProgress) ? payload.inProgress : [],
      finished: Array.isArray(payload.finished) ? payload.finished : [],
      cancelled: Array.isArray(payload.cancelled) ? payload.cancelled : [],
    };

    if (next.upcoming.length || next.inProgress.length || next.finished.length || next.cancelled.length || payload.counts) {
      return next;
    }
  }

  const races = normalizeArray(payload);
  return { ...emptyBuckets, upcoming: races, counts: { ...emptyBuckets.counts, upcoming: races.length } };
};

const allBucketRaces = (buckets) => [
  ...buckets.upcoming,
  ...buckets.inProgress,
  ...buckets.finished,
  ...buckets.cancelled,
];

const getJockeyResponse = (registration) => {
  if (typeof registration.jockeyResponse === "string") return registration.jockeyResponse;
  return registration.jockeyResponse?.status || "-";
};

const getRegistrationRaceId = (registration) => {
  if (typeof registration.race === "string") return registration.race;
  return registration.race?._id || registration.raceId || registration.raceId?._id || registration.race_id;
};

const getApprovalMeta = (status) => {
  if (status === "Approved") return { label: "Approved", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" };
  if (status === "Rejected") return { label: "Rejected", className: "bg-red-500/15 text-red-300 border-red-500/20" };
  return { label: status || "Pending", className: "bg-[#D9A520]/15 text-[#F8E7A1] border-[#D9A520]/20" };
};

const canPreviewRanking = (status) => ["Locked", "Finished"].includes(status);

const normalizeRanking = (payload) => {
  const rows = normalizeArray(payload?.rankings || payload?.results || payload);
  return rows
    .map((row, index) => ({
      ...row,
      rank: Number(row.rank ?? row.position ?? row.place ?? index + 1),
    }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return Number(a.finishTimeSec ?? a.timeSec ?? a.time ?? 0) - Number(b.finishTimeSec ?? b.timeSec ?? b.time ?? 0);
    });
};

const getRankingName = (row, field) => {
  if (field === "horse") return row.horse?.name || row.horseName || row.registration?.horse?.name || "-";
  if (field === "jockey") return row.jockey?.fullName || row.jockeyName || row.registration?.jockey?.fullName || "-";
  return "-";
};

const getRankingTime = (row) => row.finishTimeSec ?? row.timeSec ?? row.time ?? row.resultTime ?? null;

const RefereeDashboard = () => {
  const [buckets, setBuckets] = useState(emptyBuckets);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [activeView, setActiveView] = useState("races");
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [raceDetailLoading, setRaceDetailLoading] = useState(false);
  const [simulateResult, setSimulateResult] = useState(null);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [registrationActionLoading, setRegistrationActionLoading] = useState(null);

  const visibleRaces = selectedStatus === "Tất cả" ? allBucketRaces(buckets) : filteredRaces;

  const fetchRaces = async (status = selectedStatus) => {
    setLoading(true);
    setError(null);
    try {
      const params = status === "Tất cả" ? undefined : { status };
      const response = await api.get("/api/referee/races", { params });
      if (response.data?.status === "Success") {
        if (status === "Tất cả") {
          setBuckets(normalizeBuckets(response.data.data));
          setFilteredRaces([]);
        } else {
          setFilteredRaces(normalizeArray(response.data.data));
        }
      } else {
        setError(response.data?.message || "Không thể tải danh sách cuộc đua.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gọi API race của trọng tài.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRegistrations = async () => {
    setPendingLoading(true);
    try {
      const response = await api.get("/api/referee/pending-registrations");
      if (response.data?.status === "Success") {
        setPendingRegistrations(normalizeArray(response.data.data));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách jockey chờ duyệt.");
    } finally {
      setPendingLoading(false);
    }
  };

  const updateRegistrationApproval = async (registration, action) => {
    const raceId = getRegistrationRaceId(registration);
    const regId = registration._id;
    if (!raceId || !regId) {
      setError("Không tìm thấy mã race hoặc mã đăng ký để xử lý.");
      return;
    }

    const nextStatus = action === "approve" ? "Approved" : "Rejected";
    const reason = action === "approve" ? "Referee approved jockey" : "Jockey không đủ điều kiện tham gia race";
    setRegistrationActionLoading(`${regId}-${action}`);
    setError(null);
    try {
      const response = await api.patch(`/api/referee/races/${raceId}/registrations/${regId}`, {
        action,
        reason,
      });
      if (response.data?.status === "Success") {
        setPendingRegistrations((current) =>
          current.map((item) => (item._id === regId ? { ...item, approvalStatus: nextStatus } : item))
        );
        setSelectedRace((current) => {
          if (!current?.registrations?.length) return current;
          return {
            ...current,
            registrations: current.registrations.map((item) =>
              item._id === regId ? { ...item, approvalStatus: nextStatus } : item
            ),
          };
        });
        await fetchRaces(selectedStatus);
      } else {
        setError(response.data?.message || "Không thể cập nhật trạng thái đăng ký.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi duyệt/từ chối jockey.");
    } finally {
      setRegistrationActionLoading(null);
    }
  };

  const openRaceDetail = async (raceId) => {
    setRaceDetailLoading(true);
    setSimulateResult(null);
    try {
      const response = await api.get(`/api/referee/races/${raceId}`);
      if (response.data?.status === "Success") {
        setSelectedRace(response.data.data || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải chi tiết race.");
    } finally {
      setRaceDetailLoading(false);
    }
  };

  const previewSimulation = async (raceId) => {
    setSimulateLoading(true);
    setSimulateResult(null);
    try {
      const response = await api.get(`/api/referee/races/${raceId}/simulate`);
      if (response.data?.status === "Success") {
        setSimulateResult(normalizeRanking(response.data.data || []));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể preview xếp hạng race.");
    } finally {
      setSimulateLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces(selectedStatus);
  }, [selectedStatus]);

  const renderRaceCard = (race) => (
    <div key={race._id} className="rounded-[28px] border border-white/10 bg-[#090B15] p-5 shadow-[0_30px_80px_rgba(9,11,21,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[race.status] || "bg-white/5 text-gray-200"}`}>{race.status || "-"}</span>
          <h3 className="text-xl font-black text-white">{race.name}</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p className="inline-flex items-center gap-2"><Calendar size={15} /> {formatDate(race.raceDate)}</p>
            <p className="inline-flex items-center gap-2"><MapPin size={15} /> {race.location || "-"}</p>
          </div>
        </div>
        <button onClick={() => openRaceDetail(race._id)} className="rounded-2xl bg-[#D9A520] px-4 py-2 text-xs font-black uppercase text-black hover:bg-[#f2cb46]">
          Chi tiết
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-gray-400">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="font-black text-white">{race.participantCount ?? race.registrations?.length ?? 0}</p>
          <p>Đăng ký</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="font-black text-white">{race.approvedCount ?? 0}</p>
          <p>Đã duyệt</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="font-black text-white">{race.pendingApprovalCount ?? 0}</p>
          <p>Chờ duyệt</p>
        </div>
      </div>
    </div>
  );

  const renderRegistration = (registration, { showActions = false } = {}) => {
    const approvalMeta = getApprovalMeta(registration.approvalStatus);
    const approving = registrationActionLoading === `${registration._id}-approve`;
    const rejecting = registrationActionLoading === `${registration._id}-reject`;

    return (
    <div key={registration._id} className="rounded-3xl border border-white/10 bg-[#111827] p-5 transition-all hover:border-[#D9A520]/30 hover:bg-[#151B2B]">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ngựa</p>
          <p className="mt-2 font-semibold text-white">{registration.horse?.name || "-"}</p>
          <p className="text-sm text-gray-400">{registration.horse?.registrationNumber || registration.horse?.breed || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Jockey</p>
          <p className="mt-2 font-semibold text-white">{registration.jockey?.fullName || "-"}</p>
          <p className="text-sm text-gray-400">{registration.jockey?.licenseNumber || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Chủ ngựa</p>
          <p className="mt-2 font-semibold text-white">{registration.owner?.stableName || registration.owner?.fullName || "-"}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Trạng thái</p>
          <p className="inline-flex rounded-full bg-[#141B2F] px-3 py-1 text-xs font-semibold text-gray-200">Jockey: {getJockeyResponse(registration)}</p>
          <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${approvalMeta.className}`}>Duyệt: {approvalMeta.label}</p>
        </div>
      </div>
      {showActions && (
        <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
          <button
            onClick={() => updateRegistrationApproval(registration, "reject")}
            disabled={approving || rejecting || registration.approvalStatus !== "Pending"}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XCircle size={16} /> {rejecting ? "Đang từ chối..." : "Từ chối"}
          </button>
          <button
            onClick={() => updateRegistrationApproval(registration, "approve")}
            disabled={approving || rejecting || registration.approvalStatus !== "Pending"}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 size={16} /> {approving ? "Đang duyệt..." : "Duyệt jockey"}
          </button>
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-6 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Trọng tài cuộc đua ngựa</p>
          <h3 className="text-2xl font-black text-white">Race Referee</h3>
          <p className="text-sm text-gray-400">Duyệt jockey, xem race được phân công và preview xếp hạng trước khi chốt kết quả race.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Sắp bắt</p><p className="mt-2 text-2xl font-black text-white">{buckets.counts.upcoming || 0}</p></div>
        <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Đang bắt</p><p className="mt-2 text-2xl font-black text-white">{buckets.counts.inProgress || 0}</p></div>
        <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Đã đua xong</p><p className="mt-2 text-2xl font-black text-white">{buckets.counts.finished || 0}</p></div>
        <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Đã hủy</p><p className="mt-2 text-2xl font-black text-white">{buckets.counts.cancelled || 0}</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveView("races")} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeView === "races" ? "border-[#D9A520] bg-[#D9A520] text-black" : "border-white/10 bg-white/5 text-white"}`}>Race được giao</button>
        <button onClick={() => { setActiveView("pending"); fetchPendingRegistrations(); }} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeView === "pending" ? "border-[#D9A520] bg-[#D9A520] text-black" : "border-white/10 bg-white/5 text-white"}`}>Jockey chờ duyệt</button>
        <button onClick={() => fetchRaces(selectedStatus)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"><RefreshCw size={14} /> Tải lại</button>
      </div>

      {activeView === "races" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button key={status} onClick={() => setSelectedStatus(status)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${selectedStatus === status ? "border-[#D9A520] bg-[#D9A520] text-black" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>{status}</button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>
          ) : selectedStatus === "Tất cả" ? (
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-4"><h3 className="text-lg font-black text-white">Sắp bắt</h3>{buckets.upcoming.length ? buckets.upcoming.map(renderRaceCard) : <p className="rounded-3xl bg-white/5 p-6 text-sm text-gray-400">Không có race sắp bắt.</p>}</div>
              <div className="space-y-4"><h3 className="text-lg font-black text-white">Đang bắt</h3>{buckets.inProgress.length ? buckets.inProgress.map(renderRaceCard) : <p className="rounded-3xl bg-white/5 p-6 text-sm text-gray-400">Không có race đang bắt.</p>}</div>
              <div className="space-y-4"><h3 className="text-lg font-black text-white">Đã đua xong</h3>{buckets.finished.length ? buckets.finished.map(renderRaceCard) : <p className="rounded-3xl bg-white/5 p-6 text-sm text-gray-400">Không có race đã đua xong.</p>}</div>
            </div>
          ) : visibleRaces.length ? (
            <div className="grid gap-6 xl:grid-cols-2">{visibleRaces.map(renderRaceCard)}</div>
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Không có cuộc đua nào theo filter này.</div>
          )}
        </div>
      )}

      {activeView === "pending" && (
        <div className="rounded-[32px] border border-white/10 bg-[#0B101A] p-6">
          <div className="mb-6 flex items-center gap-3"><Users className="text-[#D9A520]" /><div><h3 className="text-xl font-black text-white">Tất cả jockey đăng ký</h3><p className="text-sm text-gray-400">Theo dõi mọi trạng thái và duyệt hoặc từ chối jockey cho từng race được phân công.</p></div></div>
          {pendingLoading ? <p className="py-10 text-center text-gray-400">Đang tải...</p> : pendingRegistrations.length ? <div className="space-y-4">{pendingRegistrations.map((registration) => renderRegistration(registration, { showActions: true }))}</div> : <p className="py-10 text-center text-gray-400">Không có jockey đăng ký.</p>}
        </div>
      )}

      {selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#0B101A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div><h2 className="text-xl font-black text-white">{selectedRace.name}</h2><p className="text-sm text-gray-400">{formatDate(selectedRace.raceDate)} - {selectedRace.location}</p></div>
              <button onClick={() => setSelectedRace(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-6 p-6">
              {raceDetailLoading ? <p className="text-center text-gray-400">Đang tải chi tiết...</p> : (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl bg-[#111827] p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Status</p><p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[selectedRace.status] || "bg-white/5 text-gray-200"}`}>{selectedRace.status}</p></div>
                    <div className="rounded-3xl bg-[#111827] p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Cự ly</p><p className="mt-3 text-2xl font-black text-white">{selectedRace.distanceM || "-"}m</p></div>
                    <div className="rounded-3xl bg-[#111827] p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Giải thưởng</p><p className="mt-3 text-2xl font-black text-white">₫ {Number(selectedRace.prizeMoney || 0).toLocaleString("vi-VN")}</p></div>
                    <div className="rounded-3xl bg-[#111827] p-5"><p className="text-xs uppercase tracking-[0.25em] text-gray-500">Đăng ký</p><p className="mt-3 text-2xl font-black text-white">{selectedRace.registrations?.length || 0}</p></div>
                  </div>

                  {canPreviewRanking(selectedRace.status) && (
                    <button onClick={() => previewSimulation(selectedRace._id)} className="inline-flex items-center gap-2 rounded-3xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase text-black hover:bg-[#f2cb46]"><Trophy size={18} /> {simulateLoading ? "Đang preview..." : "Preview xếp hạng"}</button>
                  )}

                  {simulateResult && (
                    <div className="rounded-[28px] border border-[#D9A520]/30 bg-[#D9A520]/10 p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <Trophy className="text-[#D9A520]" />
                        <div>
                          <h3 className="text-lg font-black text-white">Preview xếp hạng</h3>
                          <p className="text-sm text-[#F8E7A1]/80">Thứ tự 1, 2, 3, 4 được sắp theo rank/thời gian hoàn thành.</p>
                        </div>
                      </div>
                      {simulateResult.length ? (
                        <div className="space-y-3">
                          {simulateResult.map((row, idx) => {
                            const rank = row.rank || idx + 1;
                            const time = getRankingTime(row);
                            return (
                              <div key={row._id || row.registrationId || idx} className="grid gap-4 rounded-3xl border border-[#D9A520]/20 bg-black/30 p-4 text-sm text-gray-200 md:grid-cols-[80px_1fr_1fr_120px] md:items-center">
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black ${rank === 1 ? "bg-[#D9A520] text-black" : "bg-white/10 text-white"}`}>
                                    {rank}
                                  </div>
                                  <span className="text-xs font-bold uppercase tracking-widest text-[#F8E7A1]">Hạng</span>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ngựa</p>
                                  <p className="mt-1 font-bold text-white">{getRankingName(row, "horse")}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Jockey</p>
                                  <p className="mt-1 font-bold text-white">{getRankingName(row, "jockey")}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Thời gian</p>
                                  <p className="mt-1 font-bold text-white">{time != null ? `${time}s` : "-"}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="rounded-3xl bg-black/30 p-6 text-center text-[#F8E7A1]">Chưa có dữ liệu preview xếp hạng.</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-white">Danh sách đăng ký</h3>
                    {selectedRace.registrations?.length ? selectedRace.registrations.map((registration) => renderRegistration(registration, { showActions: true })) : <p className="rounded-3xl bg-white/5 p-6 text-center text-gray-400">Không có đăng ký nào.</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereeDashboard;
