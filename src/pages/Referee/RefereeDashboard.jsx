import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, Clock3, MapPin, X, Users, XCircle } from "lucide-react";
import api from "../../config/axios";

const statusStyles = {
  Draft: "bg-white/5 text-gray-300",
  Open: "bg-[#203A70] text-[#8DB7FF]",
  Locked: "bg-[#4B2C6F] text-[#D9A520]",
  Ranked: "bg-[#174A2B] text-[#7DE8B4]",
  Finished: "bg-[#1F4B2C] text-[#7DE8B4]",
  Cancelled: "bg-[#4B2C2C] text-[#FF9C8A]",
};

const statusOptions = ["Tất cả", "Draft", "Open", "Locked", "Ranked", "Finished", "Cancelled"];

const emptyBuckets = {
  counts: { upcoming: 0, inProgress: 0, ranked: 0, finished: 0, cancelled: 0 },
  upcoming: [],
  inProgress: [],
  ranked: [],
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
      ranked: Array.isArray(payload.ranked) ? payload.ranked : [],
      finished: Array.isArray(payload.finished) ? payload.finished : [],
      cancelled: Array.isArray(payload.cancelled) ? payload.cancelled : [],
    };

    if (next.upcoming.length || next.inProgress.length || next.ranked.length || next.finished.length || next.cancelled.length || payload.counts) {
      return next;
    }
  }

  const races = normalizeArray(payload);
  return { ...emptyBuckets, upcoming: races, counts: { ...emptyBuckets.counts, upcoming: races.length } };
};

const allBucketRaces = (buckets) => [
  ...buckets.upcoming,
  ...buckets.inProgress,
  ...buckets.ranked,
  ...buckets.finished,
  ...buckets.cancelled,
];

const getJockeyResponse = (registration) => {
  if (typeof registration.jockeyResponse === "string") return registration.jockeyResponse;
  return registration.jockeyResponse?.status || "-";
};

const getRegistrationRaceId = (registration) => {
  if (typeof registration.race === "string") return registration.race;
  return registration.race?._id || (typeof registration.raceId === "string" ? registration.raceId : registration.raceId?._id) || registration.race_id;
};

const normalizePendingRegistration = (item) => {
  if (!item || typeof item !== "object") return item;
  return {
    ...item,
    _id: item._id || item.registrationId,
    approvalStatus: item.approvalStatus || "Pending",
  };
};

const getApprovalMeta = (status) => {
  if (status === "Approved") return { label: "Approved", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" };
  if (status === "Rejected" || status === "Declined") return { label: status === "Declined" ? "Declined" : "Rejected", className: "bg-red-500/15 text-red-300 border-red-500/20" };
  return { label: status || "Pending", className: "bg-[#D9A520]/15 text-[#F8E7A1] border-[#D9A520]/20" };
};

const getJockeyResponseMeta = (registration) => {
  const response = getJockeyResponse(registration);

  if (response === "Declined") {
    return {
      label: "Jockey đã từ chối tham gia",
      className: "bg-red-500/15 text-red-200 border-red-500/20",
    };
  }

  if (response === "Accepted") {
    return {
      label: "Jockey đã chấp nhận",
      className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    };
  }

  return {
    label: response === "-" ? "Chờ jockey phản hồi" : response,
    className: "bg-[#D9A520]/15 text-[#F8E7A1] border-[#D9A520]/20",
  };
};

const RefereeDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buckets, setBuckets] = useState(emptyBuckets);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationActionLoading, setRegistrationActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const activeView = location.pathname.startsWith("/referee/pending") ? "pending" : "races";

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
        setPendingRegistrations(normalizeArray(response.data.data).map(normalizePendingRegistration));
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

    const nextStatus = action === "approve" ? "Approved" : "Declined";
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

  const openApprovalConfirm = (registration, action) => {
    if (!registration || !action) return;
    setConfirmAction({ registration, action });
    setError(null);
  };

  const closeApprovalConfirm = () => {
    setConfirmAction(null);
  };

  const confirmApprovalAction = async () => {
    if (!confirmAction) return;
    const { registration, action } = confirmAction;
    closeApprovalConfirm();
    await updateRegistrationApproval(registration, action);
  };

  const openRaceDetail = (raceId) => {
    navigate(`/referee/races/${raceId}`);
  };

  const renderRaceCard = (race) => (
    <div key={race._id} className="rounded-[28px] border border-white/10 bg-[#090B15] p-5 shadow-[0_30px_80px_rgba(9,11,21,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[race.status] || "bg-white/5 text-gray-200"}`}>{race.status || "-"}</span>
          <h3 className="text-xl font-black text-white">{race.name}</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p className="inline-flex items-center gap-2"><Calendar size={15} /> Ngày đua: {formatDate(race.raceDate)}</p>
            <p className="inline-flex items-center gap-2 text-[#F8E7A1]"><Clock3 size={15} /> Đóng form: {formatDate(race.registrationCloseAt)}</p>
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
    const jockeyResponseMeta = getJockeyResponseMeta(registration);
    const approving = registrationActionLoading === `${registration._id}-approve`;
    const rejecting = registrationActionLoading === `${registration._id}-decline`;
    const canActOnRegistration = getJockeyResponse(registration) !== "Declined";
    const raceName = registration.raceName || registration.race?.name;
    const raceDateValue = registration.raceDate || registration.race?.raceDate;

    return (
    <div key={registration._id} className="rounded-3xl border border-white/10 bg-[#111827] p-5 transition-all hover:border-[#D9A520]/30 hover:bg-[#151B2B]">
      {(raceName || raceDateValue) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Race</p>
            <p className="mt-1 font-semibold text-white">{raceName || "-"}</p>
          </div>
          <p className="text-gray-400">{formatDate(raceDateValue)}</p>
        </div>
      )}
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
          <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${jockeyResponseMeta.className}`}>{jockeyResponseMeta.label}</p>
          <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${approvalMeta.className}`}>Duyệt: {approvalMeta.label}</p>
        </div>
      </div>
      {showActions && (
        <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
          <button
            onClick={() => openApprovalConfirm(registration, "decline")}
            disabled={approving || rejecting || !canActOnRegistration}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XCircle size={16} /> {rejecting ? "Đang từ chối..." : "Từ chối"}
          </button>
          <button
            onClick={() => openApprovalConfirm(registration, "approve")}
            disabled={approving || rejecting || !canActOnRegistration}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 size={16} /> {approving ? "Đang duyệt..." : "Duyệt jockey"}
          </button>
          {!canActOnRegistration && getJockeyResponse(registration) === "Declined" && (
            <p className="w-full text-right text-sm text-red-300">Jockey đã từ chối tham gia nên không thể duyệt hoặc từ chối từ phía trọng tài.</p>
          )}
        </div>
      )}
    </div>
    );
  };

  useEffect(() => {
    if (activeView === "races") {
      fetchRaces(selectedStatus);
    } else if (activeView === "pending") {
      fetchPendingRegistrations();
    }
  }, [activeView, selectedStatus]);

  useEffect(() => {
    if (activeView === "races") {
      setSelectedStatus("Tất cả");
    }
  }, [activeView]);

  return (
    <div className="space-y-6">
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
            <div className="grid gap-6 xl:grid-cols-4">
               <div className="space-y-4"><h3 className="text-lg font-black text-white">Sắp bắt</h3>{buckets.upcoming.length ? buckets.upcoming.map(renderRaceCard) : <p className="rounded-3xl bg-white/5 p-6 text-sm text-gray-400">Không có race sắp bắt.</p>}</div>
               <div className="space-y-4"><h3 className="text-lg font-black text-white">Đang bắt</h3>{buckets.inProgress.length ? buckets.inProgress.map(renderRaceCard) : <p className="rounded-3xl bg-white/5 p-6 text-sm text-gray-400">Không có race đang bắt.</p>}</div>
               <div className="space-y-4"><h3 className="text-lg font-black text-white">Đã chấm</h3>{buckets.ranked.length ? buckets.ranked.map(renderRaceCard) : <p className="rounded-3xl bg-white/5 p-6 text-sm text-gray-400">Không có race đã chấm.</p>}</div>
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
          <div className="mb-6 flex items-center gap-3">
            <Users className="text-[#D9A520]" />
            <div>
              <h3 className="text-xl font-black text-white">Tất cả jockey đăng ký</h3>
              <p className="text-sm text-gray-400">Theo dõi mọi trạng thái và duyệt hoặc từ chối jockey cho từng race được phân công.</p>
            </div>
          </div>
          {pendingLoading ? (
            <p className="py-10 text-center text-gray-400">Đang tải...</p>
          ) : pendingRegistrations.length ? (
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => renderRegistration(registration, { showActions: true }))}
            </div>
          ) : (
            <p className="py-10 text-center text-gray-400">Không có jockey đăng ký.</p>
          )}
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0B101A] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Xác nhận thao tác</p>
                <h3 className="mt-2 text-2xl font-black text-white">{confirmAction.action === "approve" ? "Duyệt jockey" : "Từ chối jockey"}</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Bạn sắp {confirmAction.action === "approve" ? "duyệt" : "từ chối"} đăng ký cho jockey <span className="font-semibold text-white">{confirmAction.registration.jockey?.fullName || "-"}</span>.
                </p>
              </div>
              <button onClick={closeApprovalConfirm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-[#111827] p-5 text-sm text-gray-300">
              <p>Race: <span className="text-white">{confirmAction.registration.race?.name || confirmAction.registration.raceName || "-"}</span></p>
              <p className="mt-2">Ngựa: <span className="text-white">{confirmAction.registration.horse?.name || "-"}</span></p>
              <p className="mt-2">Trạng thái jockey: <span className="text-white">{getJockeyResponse(confirmAction.registration)}</span></p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={closeApprovalConfirm} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Hủy
              </button>
              <button onClick={confirmApprovalAction} className={`rounded-2xl px-5 py-3 text-sm font-black text-black ${confirmAction.action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-400 hover:bg-red-500"}`}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereeDashboard;
