import { useEffect, useState } from "react";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";

import api from "../../config/axios";

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.penalties)) return payload.penalties;
  if (Array.isArray(payload?.appeals)) return payload.appeals;
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

const getRaceName = (item) => item.race?.name || item.raceName || item.race?.title || "-";
const getHorseName = (item) => item.horse?.name || item.registration?.horse?.name || item.horseName || "-";
const getPenaltyReason = (item) => item.reason || item.penalty?.reason || item.appealReason || item.content || "-";
const getPenaltyTime = (item) => item.timePenaltySec ?? item.penalty?.timePenaltySec ?? item.penaltySec ?? 0;
const getStatus = (item) => item.status || item.appealStatus || "Pending";
const getCreatedAt = (item) => item.createdAt || item.appealedAt || item.updatedAt;
const getId = (item, index) => item._id || item.penaltyId || item.appealId || `${index}`;

const statusMeta = (status) => {
  const normalized = String(status || "Pending").toLowerCase();
  if (normalized.includes("approved") || normalized.includes("accepted")) {
    return { label: status, className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" };
  }
  if (normalized.includes("reject") || normalized.includes("declin")) {
    return { label: status, className: "bg-red-500/15 text-red-300 border-red-500/20" };
  }
  if (normalized.includes("pending")) {
    return { label: status, className: "bg-[#D9A520]/15 text-[#F8E7A1] border-[#D9A520]/20" };
  }
  return { label: status, className: "bg-white/10 text-gray-200 border-white/10" };
};

const JockeyPenalties = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPenalties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/jockey/penalties");
      if (response.data?.status === "Success") {
        setItems(normalizeArray(response.data.data));
      } else {
        setError(response.data?.message || "Không thể tải danh sách án phạt.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải danh sách án phạt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[#1C152B] p-8 shadow-[0_30px_80px_rgba(28,21,43,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Án phạt & Kháng án</p>
            <h1 className="mt-2 text-3xl font-black text-white">Lịch sử án phạt của tôi</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              Danh sách tất cả án phạt và kháng án của chính jockey, sắp xếp mới nhất lên đầu theo dữ liệu API.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchPenalties}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#EBCB75] px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-[#f4d98f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải lại
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#0F0B19] p-4 border border-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Tổng mục</p>
            <p className="mt-2 text-2xl font-black text-white">{items.length}</p>
          </div>
          <div className="rounded-3xl bg-[#0F0B19] p-4 border border-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Thứ tự</p>
            <p className="mt-2 text-2xl font-black text-white">Mới nhất</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>}

      <div className="rounded-[32px] border border-white/10 bg-[#150F22] p-6 shadow-[0_30px_80px_rgba(9,11,21,0.25)]">
        <div className="mb-6 flex items-center gap-3">
          <AlertTriangle className="text-[#EBCB75]" />
          <div>
            <h2 className="text-xl font-black text-white">Danh sách án phạt và kháng án</h2>
            <p className="text-sm text-gray-400">Các mục mới nhất được đưa lên đầu.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-[#0F0B19] p-10 text-center text-gray-400">Đang tải danh sách...</div>
        ) : items.length ? (
          <div className="space-y-4">
            {items
              .slice()
              .sort((a, b) => new Date(b.createdAt || b.appealedAt || b.updatedAt || 0) - new Date(a.createdAt || a.appealedAt || a.updatedAt || 0))
              .map((item, index) => {
                const meta = statusMeta(getStatus(item));
                return (
                  <div key={getId(item, index)} className="rounded-[28px] border border-white/10 bg-[#0F0B19] p-5 transition hover:border-[#EBCB75]/30 hover:bg-[#181126]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-gray-300">#{index + 1}</span>
                        </div>
                        <h3 className="text-lg font-black text-white">{getRaceName(item)}</h3>
                        <p className="inline-flex items-center gap-2 text-sm text-gray-400"><Clock size={15} /> {formatDate(getCreatedAt(item))}</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-gray-200">
                        Thời gian phạt: <span className="font-black text-[#EBCB75]">+{getPenaltyTime(item)}s</span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ngựa</p>
                        <p className="mt-2 font-semibold text-white">{getHorseName(item)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Race</p>
                        <p className="mt-2 font-semibold text-white">{getRaceName(item)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Trạng thái</p>
                        <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-[#150F22] p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Lý do</p>
                      <p className="text-sm leading-6 text-gray-300">{getPenaltyReason(item)}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[#0F0B19] p-10 text-center text-gray-400">Không có án phạt hoặc kháng án nào.</div>
        )}
      </div>
    </div>
  );
};

export default JockeyPenalties;
