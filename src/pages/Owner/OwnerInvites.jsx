import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/axios";
import { CheckCircle2, Clock3, Mail, XCircle } from "lucide-react";
import { alertSuccess, alertFail } from "../../assets/hook/useNotification";

const normalizeText = (value) => (value == null ? "" : String(value).trim());

const normalizeInvites = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.invites)) return payload.invites;
  if (Array.isArray(payload?.data?.invites)) return payload.data.invites;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const getInviteStatus = (invite) => normalizeText(invite?.inviteStatus || invite?.responseStatus || invite?.ownerResponseStatus || invite?.status);

const getRaceStatus = (invite) => normalizeText(invite?.race?.status || invite?.raceStatus || invite?.race?.state || invite?.status);

const getRaceId = (invite) => invite?.race?._id || invite?.raceId || invite?.race?.id || invite?._id;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const OwnerInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState("");
  const [reasonText, setReasonText] = useState({});

  const fetchInvites = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/owner/invites");
      if (res.data?.status === "Success") {
        setInvites(normalizeInvites(res.data?.data || res.data));
      } else {
        setError(res.data?.message || "Không lấy được danh sách lời mời");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi tải lời mời");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const pendingInvites = useMemo(() => invites.filter((invite) => {
    const inviteStatus = getInviteStatus(invite).toLowerCase();
    return inviteStatus === "pending";
  }), [invites]);

  const handleRespond = async (invite, action) => {
    const raceId = getRaceId(invite);
    if (!raceId) {
      alertFail("Không tìm thấy mã cuộc đua để phản hồi");
      return;
    }

    setRespondingId(`${raceId}-${action}`);
    try {
      const payload = {
        action: action === "accept" ? "accept" : "decline",
        reason: normalizeText(reasonText[raceId] || ""),
      };
      const res = await api.post(`/api/owner/invites/${raceId}/respond`, payload);
      if (res.data?.status === "Success") {
        const nextStatus = action === "accept" ? "Accepted" : "Declined";
        setInvites((prev) => prev.map((item) => {
          const currentRaceId = getRaceId(item);
          if (currentRaceId !== raceId) return item;
          return {
            ...item,
            status: nextStatus,
            inviteStatus: nextStatus,
            responseStatus: nextStatus,
          };
        }));
        setReasonText((prev) => ({ ...prev, [raceId]: "" }));
        alertSuccess(action === "accept" ? "Bạn đã đồng ý lời mời tham gia cuộc đua." : "Bạn đã từ chối lời mời tham gia cuộc đua.");
      } else {
        alertFail(res.data?.message || "Không thể gửi phản hồi");
      }
    } catch (err) {
      alertFail(err.response?.data?.message || err.message || "Lỗi khi gửi phản hồi");
    } finally {
      setRespondingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Lời mời tham gia cuộc đua</h2>
          <p className="text-sm text-gray-400">Xem và phản hồi lời mời từ quản trị viên cho các cuộc đua đang mở hoặc draft.</p>
        </div>
        <div className="rounded-2xl border border-[#D9A520]/20 bg-[#D9A520]/10 px-4 py-3 text-sm text-[#F6D46B]">
          <span className="font-semibold">Lưu ý:</span> Từ chối chỉ là tín hiệu ý định, không chặn việc đăng ký ngựa sau này.
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[#0D1117] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white">Danh sách lời mời</h3>
            <p className="text-sm text-gray-400">{pendingInvites.length} lời mời đang chờ phản hồi</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-gray-400">
            <Mail size={14} />
            <span>Owner Portal</span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-gray-400">Đang tải lời mời...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">{error}</div>
        ) : invites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-gray-400">Hiện chưa có lời mời nào.</div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => {
              const inviteStatus = getInviteStatus(invite).toLowerCase();
              const raceStatus = getRaceStatus(invite).toLowerCase();
              const raceId = getRaceId(invite);
              const isResponded = inviteStatus === "accepted" || inviteStatus === "declined";

              return (
                <div key={raceId || `${invite?.race?.name || invite?.name}-${invite?.owner?.fullName}`} className="rounded-[20px] border border-white/10 bg-[#111827] p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#D9A520]/15 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#F6D46B]">
                          {invite?.race?.name || invite?.raceName || invite?.name || "Cuộc đua"}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          raceStatus === "draft" || raceStatus === "open"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-gray-500/15 text-gray-400"
                        }`}>
                          {invite?.race?.status || invite?.raceStatus || invite?.status || "-"}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          inviteStatus === "pending"
                            ? "bg-[#D9A520]/15 text-[#F6D46B]"
                            : inviteStatus === "accepted"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                        }`}>
                          {inviteStatus === "pending" ? "Pending" : inviteStatus === "accepted" ? "Accepted" : inviteStatus === "declined" ? "Declined" : inviteStatus || "-"}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                        <div>
                          <span className="text-gray-500">Ngày phản hồi:</span> {formatDateTime(invite?.respondedAt)}
                        </div>
                        <div>
                          <span className="text-gray-500">Ngày diễn ra:</span> {formatDateTime(invite?.race?.raceDate || invite?.raceDate)}
                        </div>
                        <div>
                          <span className="text-gray-500">Địa điểm:</span> {invite?.race?.location || invite?.location || "-"}
                        </div>
                        <div>
                          <span className="text-gray-500">Giải thưởng:</span> {invite?.race?.prizeMoney ?? invite?.prizeMoney ? `${Number(invite?.race?.prizeMoney ?? invite?.prizeMoney).toLocaleString("vi-VN")}₫` : "-"}
                        </div>
                        <div><span className="text-gray-500">Đã đăng ký:</span> {invite?.hasRegistered ? "Có" : "Chưa"}</div>
                        {invite?.declineReason && <div><span className="text-gray-500">Lý do từ chối:</span> {invite.declineReason}</div>}
                      </div>
                    </div>

                    <div className="w-full max-w-md space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Lý do / ghi chú (tùy chọn)</label>
                      <textarea
                        value={reasonText[raceId] || ""}
                        onChange={(e) => setReasonText((prev) => ({ ...prev, [raceId]: e.target.value }))}
                        placeholder="Nhập lý do nếu bạn muốn"
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-[#D9A520]/50"
                        disabled={Boolean(respondingId) || isResponded}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleRespond(invite, "accept")}
                          disabled={Boolean(respondingId) || isResponded}
                          className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {respondingId === `${raceId}-accept` ? <Clock3 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          Đồng ý
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespond(invite, "decline")}
                          disabled={Boolean(respondingId) || isResponded}
                          className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {respondingId === `${raceId}-decline` ? <Clock3 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerInvites;
