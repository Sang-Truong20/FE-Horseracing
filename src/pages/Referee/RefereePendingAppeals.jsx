import { useEffect, useState } from "react";
import { AlertCircle, Clock, FileText, RefreshCw, XCircle } from "lucide-react";

import api from "../../config/axios";

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.appeals)) return payload.appeals;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object" && payload._id) return [payload];
  return [];
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

const getRaceName = (appeal) => appeal.race?.name || appeal.raceName || appeal.race?.title || "-";

const getRaceDate = (appeal) => appeal.race?.raceDate || appeal.raceDate || appeal.createdAt;

const getHorseName = (appeal) => appeal.registration?.horse?.name || appeal.horse?.name || appeal.horseName || "-";

const getJockeyName = (appeal) => appeal.registration?.jockey?.fullName || appeal.jockey?.fullName || appeal.jockeyName || "-";

const getOwnerName = (appeal) =>
  appeal.registration?.owner?.stableName ||
  appeal.registration?.owner?.fullName ||
  appeal.owner?.stableName ||
  appeal.owner?.fullName ||
  appeal.ownerName ||
  "-";

const getAppealReason = (appeal) =>
  appeal.appealReason || appeal.penaltyReason || appeal.reason || appeal.content || appeal.description || appeal.note || "-";

const getAppealId = (appeal, index) => appeal._id || appeal.appealId || `${appeal.registration?._id || "appeal"}-${index}`;

const getRaceId = (appeal) => appeal.raceId || appeal.race?._id || appeal.race?.id || "";
const getRegId = (appeal) => appeal.registrationId || appeal.registration?._id || appeal.registration?.id || "";
const getPenaltyId = (appeal) => appeal.penaltyId || appeal.penalty?._id || appeal.penalty?.id || "";

const RefereePendingAppeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchPendingAppeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/referee/pending-appeals");
      if (response.data?.status === "Success") {
        setAppeals(normalizeArray(response.data.data));
      } else {
        setError(response.data?.message || "Không thể tải danh sách kháng cáo.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải danh sách kháng cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAppeals();
  }, []);

  const openCancelDialog = (appeal) => {
    setCancelDialog(appeal);
    setCancelReason("");
    setError(null);
    setSuccessMessage(null);
  };

  const closeCancelDialog = () => {
    if (submittingCancel) return;
    setCancelDialog(null);
  };

  const submitCancelPenalty = async () => {
    if (!cancelDialog || !cancelReason.trim()) {
      setError("Vui lòng nhập lý do gỡ án phạt.");
      return;
    }

    const raceId = getRaceId(cancelDialog);
    const regId = getRegId(cancelDialog);
    const penaltyId = getPenaltyId(cancelDialog);
    if (!raceId || !regId || !penaltyId) {
      setError("Thiếu thông tin race/registration/penalty để gỡ án phạt.");
      return;
    }

    setSubmittingCancel(true);
    setError(null);
    try {
      const response = await api.delete(
        `/api/referee/races/${raceId}/registrations/${regId}/penalty/${penaltyId}`,
        { data: { cancelReason: cancelReason.trim() } }
      );
      if (response.data?.status === "Success") {
        setSuccessMessage(response.data?.message || "Đã gỡ án phạt thành công.");
        setCancelDialog(null);
        await fetchPendingAppeals();
      } else {
        setError(response.data?.message || "Không thể gỡ án phạt.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gỡ án phạt.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-200">{successMessage}</div>}

      <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Kháng cáo</p>
            <h1 className="mt-2 text-3xl font-black text-white">Danh sách chờ kháng cáo</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              Hiển thị tất cả kháng án Pending trên các race được phân công cho trọng tài, theo thứ tự FIFO từ API.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchPendingAppeals}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-[#f2cb46] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải lại
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#0F1322] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-black text-[#D9A520]">{appeals.length}</p>
          </div>
          <div className="rounded-3xl bg-[#0F1322] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Sort</p>
            <p className="mt-2 text-2xl font-black text-white">FIFO</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>}

      <div className="rounded-[32px] border border-white/10 bg-[#0B101A] p-6">
        <div className="mb-6 flex items-center gap-3">
          <FileText className="text-[#D9A520]" />
          <div>
            <h2 className="text-xl font-black text-white">Kháng cáo đang chờ xử lý</h2>
            <p className="text-sm text-gray-400">Danh sách được lấy trực tiếp từ endpoint dành cho trọng tài.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-10 text-center text-gray-400">Đang tải danh sách kháng cáo...</div>
        ) : appeals.length ? (
          <div className="space-y-4">
            {appeals.map((appeal, index) => (
              <div key={getAppealId(appeal, index)} className="rounded-[28px] border border-white/10 bg-[#111827] p-5 transition hover:border-[#D9A520]/30 hover:bg-[#151B2B]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#D9A520]/20 bg-[#D9A520]/15 px-3 py-1 text-xs font-bold text-[#F8E7A1]">#{index + 1} FIFO</span>
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200">{appeal.status || "Pending"}</span>
                    </div>
                    <h3 className="text-lg font-black text-white">{getRaceName(appeal)}</h3>
                    <p className="inline-flex items-center gap-2 text-sm text-gray-400"><Clock size={15} /> {formatDate(getRaceDate(appeal))}</p>
                  </div>
                  {/* removed visible appeal id per API requirement; reasons are shown below */}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ngựa</p>
                    <p className="mt-2 font-semibold text-white">{getHorseName(appeal)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Jockey</p>
                    <p className="mt-2 font-semibold text-white">{getJockeyName(appeal)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Owner</p>
                    <p className="mt-2 font-semibold text-white">{getOwnerName(appeal)}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-[#0A0D17] p-4">
                  <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-500"><AlertCircle size={14} /> Nội dung</p>
                  <p className="text-sm leading-6 text-gray-300">{getAppealReason(appeal)}</p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => openCancelDialog(appeal)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
                  >
                    <XCircle size={16} /> Gỡ án phạt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-10 text-center text-gray-400">Không có kháng cáo Pending.</div>
        )}
      </div>

      {cancelDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0B101A] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-red-400">Gỡ án phạt</p>
                <h3 className="mt-2 text-2xl font-black text-white">{getRaceName(cancelDialog)}</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Xác nhận gỡ án phạt cho <span className="font-semibold text-white">{getJockeyName(cancelDialog)}</span>.
                  Hành động này ghi nhận lịch sử audit.
                </p>
              </div>
              <button onClick={closeCancelDialog} disabled={submittingCancel} className="text-gray-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-gray-300">
                Lý do gỡ án phạt
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); setError(null); }}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-red-400"
                  placeholder="Ghi nhầm jockey / Jockey kháng án thành công"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeCancelDialog}
                disabled={submittingCancel}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={submitCancelPenalty}
                disabled={submittingCancel || !cancelReason.trim()}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingCancel ? "Đang xử lý..." : "Xác nhận gỡ án phạt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereePendingAppeals;
