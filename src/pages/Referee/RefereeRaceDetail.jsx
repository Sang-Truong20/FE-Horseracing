import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Clock, Crown, MapPin, Medal, Trophy } from "lucide-react";

import api from "../../config/axios";

const statusStyles = {
  Open: "bg-[#203A70] text-[#8DB7FF]",
  Locked: "bg-[#4B2C6F] text-[#D9A520]",
  Finished: "bg-[#1F4B2C] text-[#7DE8B4]",
  Cancelled: "bg-[#4B2C2C] text-[#FF9C8A]",
  Closed: "bg-[#4B2C6F] text-[#D9A520]",
  Pending: "bg-[#3B3F65] text-[#A6B0FF]",
};

const winnerRankStyles = {
  1: {
    label: "Quán quân",
    Icon: Crown,
    cardClassName: "border-[#FFD166]/50 bg-gradient-to-br from-[#3A2A08] via-[#16130B] to-[#0A0D17] shadow-[0_20px_60px_rgba(255,209,102,0.16)]",
    iconClassName: "bg-[#FFD166] text-[#251703] shadow-[0_0_30px_rgba(255,209,102,0.45)]",
    badgeClassName: "bg-[#FFD166] text-[#251703]",
  },
  2: {
    label: "Á quân",
    Icon: Trophy,
    cardClassName: "border-[#C7D2FE]/45 bg-gradient-to-br from-[#252A44] via-[#121827] to-[#0A0D17] shadow-[0_20px_60px_rgba(199,210,254,0.12)]",
    iconClassName: "bg-[#C7D2FE] text-[#182038] shadow-[0_0_26px_rgba(199,210,254,0.35)]",
    badgeClassName: "bg-[#C7D2FE] text-[#182038]",
  },
  3: {
    label: "Hạng ba",
    Icon: Medal,
    cardClassName: "border-[#F4A261]/45 bg-gradient-to-br from-[#3B2116] via-[#17110F] to-[#0A0D17] shadow-[0_20px_60px_rgba(244,162,97,0.12)]",
    iconClassName: "bg-[#F4A261] text-[#2B1208] shadow-[0_0_26px_rgba(244,162,97,0.32)]",
    badgeClassName: "bg-[#F4A261] text-[#2B1208]",
  },
};

const getRegistrationId = (registration) => registration?._id || registration?.registrationId;

const getWinnerRankStyle = (rank) => winnerRankStyles[Number(rank)];

const getRegistrationResultValue = (registration, key) => registration?.[key] ?? registration?.result?.[key] ?? "";

const getRegistrationPenalty = (registration) => registration?.penalty || registration?.result?.penalty || {};

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

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

const RefereeRaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [resultRanks, setResultRanks] = useState({});
  const [resultFinishTimes, setResultFinishTimes] = useState({});
  const [resultPenalties, setResultPenalties] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingResults, setSubmittingResults] = useState(false);
  const [confirmResultsOpen, setConfirmResultsOpen] = useState(false);
  const [pendingResults, setPendingResults] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [penaltyTargetReg, setPenaltyTargetReg] = useState(null);
  const [penaltyReason, setPenaltyReason] = useState("");
  const [penaltyTimeSec, setPenaltyTimeSec] = useState("");
  const [submittingPenalty, setSubmittingPenalty] = useState(false);

  const fetchRace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/referee/races/${id}`);
      if (response.data?.status === "Success") {
        const nextRace = response.data.data || null;
        setRace(nextRace);
        setResultRanks(
          (nextRace?.registrations || []).reduce((acc, registration) => {
            const registrationId = getRegistrationId(registration);
            if (registrationId) acc[registrationId] = registration.rank || "";
            return acc;
          }, {})
        );
        setResultFinishTimes(
          (nextRace?.registrations || []).reduce((acc, registration) => {
            const registrationId = getRegistrationId(registration);
            if (registrationId) acc[registrationId] = getRegistrationResultValue(registration, "finishTimeSec");
            return acc;
          }, {})
        );
        setResultPenalties(
          (nextRace?.registrations || []).reduce((acc, registration) => {
            const registrationId = getRegistrationId(registration);
            const penalty = getRegistrationPenalty(registration);
            if (registrationId) {
              acc[registrationId] = {
                reason: penalty.reason || "",
                timePenaltySec: penalty.timePenaltySec ?? "",
              };
            }
            return acc;
          }, {})
        );
      } else {
        setError(response.data?.message || "Không thể tải chi tiết race.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gọi API.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRace();
  }, [fetchRace]);

  const handleRankChange = (registrationId, value) => {
    setResultRanks((current) => ({ ...current, [registrationId]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleFinishTimeChange = (registrationId, value) => {
    setResultFinishTimes((current) => ({ ...current, [registrationId]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handlePenaltyChange = (registrationId, field, value) => {
    setResultPenalties((current) => ({
      ...current,
      [registrationId]: {
        ...(current[registrationId] || { reason: "", timePenaltySec: "" }),
        [field]: value,
      },
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const buildResultsPayload = () => {
    const registrations = race?.registrations || [];
    const results = registrations.map((registration) => {
      const registrationId = getRegistrationId(registration);
      const penalty = resultPenalties[registrationId] || {};
      const penaltyReason = penalty.reason || "";
      const hasPenaltyReason = penaltyReason.trim();
      const hasPenaltyTime = penalty.timePenaltySec !== "";
      const timePenaltySec = hasPenaltyTime ? Number(penalty.timePenaltySec) : 0;
      const result = {
        registrationId,
        rank: Number(resultRanks[registrationId]),
        finishTimeSec: Number(resultFinishTimes[registrationId]),
      };

      if (hasPenaltyReason || hasPenaltyTime) {
        result.penalty = {
          reason: penaltyReason,
          timePenaltySec,
        };
      }

      return result;
    });

    if (!registrations.length) {
      setError("Race chưa có đăng ký để chấm thứ hạng.");
      return null;
    }

    if (results.some((item) => !item.registrationId || !Number.isInteger(item.rank) || item.rank < 1)) {
      setError("Vui lòng nhập thứ hạng là số nguyên lớn hơn 0 cho tất cả đăng ký.");
      return null;
    }

    if (results.some((item) => !Number.isFinite(item.finishTimeSec) || item.finishTimeSec < 0)) {
      setError("Vui lòng nhập thời gian hoàn thành hợp lệ cho tất cả đăng ký.");
      return null;
    }

    if (results.some((item) => item.penalty && (!item.penalty.reason.trim() || !Number.isFinite(item.penalty.timePenaltySec) || item.penalty.timePenaltySec < 0))) {
      setError("Penalty cần có lý do và số giây phạt hợp lệ.");
      return null;
    }

    const uniqueRanks = new Set(results.map((item) => item.rank));
    if (uniqueRanks.size !== results.length) {
      setError("Thứ hạng không được trùng nhau giữa các đăng ký.");
      return null;
    }

    return results;
  };

  const openResultsConfirm = () => {
    const results = buildResultsPayload();
    if (!results) return;

    setPendingResults(results);
    setConfirmResultsOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const closeResultsConfirm = () => {
    if (submittingResults) return;
    setConfirmResultsOpen(false);
  };

  const submitRaceResults = async () => {
    const results = pendingResults.length ? pendingResults : buildResultsPayload();
    if (!results) return;

    setSubmittingResults(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const isEditingFinalizedResults = race?.status === "Finished";
      const response = isEditingFinalizedResults
        ? await api.patch(`/api/referee/races/${id}/results`, { results })
        : await api.post(`/api/referee/races/${id}/results`, { results });
      if (response.data?.status === "Success") {
        setSuccessMessage(response.data?.message || (isEditingFinalizedResults ? "Đã cập nhật kết quả race thành công." : "Đã chốt kết quả race thành công."));
        setConfirmResultsOpen(false);
        setPendingResults([]);
        await fetchRace();
      } else {
        setError(response.data?.message || (isEditingFinalizedResults ? "Không thể cập nhật kết quả race." : "Không thể chốt kết quả race."));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi kết quả race.");
    } finally {
      setSubmittingResults(false);
    }
  };

  const openLeaderboard = async () => {
    setLeaderboardOpen(true);
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    setLeaderboardData(null);
    try {
      const response = await api.get(`/api/races/${id}/leaderboard`);
      if (response.data?.status === "Success") {
        setLeaderboardData(response.data.data || null);
      } else {
        setLeaderboardError(response.data?.message || "Không thể tải bảng xếp hạng race.");
      }
    } catch (err) {
      setLeaderboardError(err.response?.data?.message || "Lỗi khi tải bảng xếp hạng race.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const openPenaltyModal = (registration) => {
    setPenaltyTargetReg(registration);
    setPenaltyReason("");
    setPenaltyTimeSec("");
    setError(null);
    setSuccessMessage(null);
    setPenaltyModalOpen(true);
  };

  const closePenaltyModal = () => {
    if (submittingPenalty) return;
    setPenaltyModalOpen(false);
    setPenaltyTargetReg(null);
  };

  const submitPenalty = async () => {
    if (!penaltyTargetReg || !penaltyReason.trim() || !penaltyTimeSec || Number(penaltyTimeSec) <= 0) {
      setError("Vui lòng nhập lý do và số giây phạt lớn hơn 0.");
      return;
    }

    const regId = getRegistrationId(penaltyTargetReg);
    setSubmittingPenalty(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await api.post(`/api/referee/races/${id}/registrations/${regId}/penalty`, {
        reason: penaltyReason.trim(),
        timePenaltySec: Number(penaltyTimeSec),
      });
      if (response.data?.status === "Success") {
        setSuccessMessage(response.data?.message || `Đã phạt ${penaltyTargetReg.horse?.name || "ngựa"} thành công.`);
        setPenaltyModalOpen(false);
        setPenaltyTargetReg(null);
        await fetchRace();
      } else {
        setError(response.data?.message || "Không thể thêm penalty.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi thêm penalty.");
    } finally {
      setSubmittingPenalty(false);
    }
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10"
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      {loading ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Đang tải chi tiết cuộc đua...</div>
      ) : error && !race ? (
        <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>
      ) : !race ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-10 text-center text-gray-400">Race không tồn tại.</div>
      ) : (
        <div className="space-y-8">
          {error && <div className="rounded-[32px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{error}</div>}

          {successMessage && <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-200">{successMessage}</div>}

          <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                <button
                  type="button"
                  onClick={openLeaderboard}
                  className="col-span-2 rounded-3xl bg-[#D9A520] p-4 text-left font-black text-black transition hover:bg-[#f2cb46] sm:col-span-3"
                >
                  Xem bảng xếp hạng
                </button>
              </div>
            </div>
          </div>

          {(race.status === "Locked" || race.status === "Finished") && (
            <div className="rounded-[32px] border border-[#D9A520]/20 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold text-[#D9A520]">Chấm kết quả</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{race.status === "Finished" ? "Sửa kết quả cuộc đua" : "Chốt kết quả cuộc đua"}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-gray-400">
                    Nhập thứ hạng, thời gian hoàn thành và penalty nếu có. Race đã Finished có thể sửa kết quả trong 180 phút sau khi chốt.
                  </p>
                </div>
                <button
                  onClick={openResultsConfirm}
                  disabled={submittingResults || !race.registrations?.length}
                  className="rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-[#f2cb46] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingResults ? "Đang gửi..." : race.status === "Finished" ? "Cập nhật kết quả" : "Chốt kết quả"}
                </button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {race.registrations?.length ? (
                  race.registrations.map((registration) => {
                    const registrationId = getRegistrationId(registration);
                    const rankStyle = getWinnerRankStyle(resultRanks[registrationId]);
                    const WinnerIcon = rankStyle?.Icon;
                    return (
                      <div key={registrationId} className={`rounded-[28px] border p-5 transition-all ${rankStyle?.cardClassName || "border-white/10 bg-[#0A0D17]"}`}>
                        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div className="flex gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${rankStyle?.iconClassName || "bg-white/5 text-gray-400"}`}>
                              {WinnerIcon ? <WinnerIcon size={24} /> : <Trophy size={22} />}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-white">{registration.horse?.name || registration.horse?.registrationNumber || "-"}</p>
                                {rankStyle && <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${rankStyle.badgeClassName}`}>{rankStyle.label}</span>}
                              </div>
                              <p className="mt-1 text-sm text-gray-400">Jockey: {registration.jockey?.fullName || "-"}</p>
                              <p className="mt-1 text-sm text-gray-400">Owner: {registration.owner?.stableName || registration.owner?.fullName || "-"}</p>
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                            <label className="block text-sm text-gray-300">
                              Thứ hạng
                              <input
                                type="number"
                                min="1"
                                step="1"
                              value={resultRanks[registrationId] ?? ""}
                                onChange={(event) => handleRankChange(registrationId, event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                                placeholder="1"
                              />
                            </label>
                            <label className="block text-sm text-gray-300">
                              Finish time (giây)
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={resultFinishTimes[registrationId] ?? ""}
                                onChange={(event) => handleFinishTimeChange(registrationId, event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                                placeholder="0.01"
                              />
                            </label>
                            <label className="block text-sm text-gray-300 sm:col-span-2">
                              Lý do penalty
                              <input
                                type="text"
                                value={resultPenalties[registrationId]?.reason ?? ""}
                                onChange={(event) => handlePenaltyChange(registrationId, "reason", event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                                placeholder="Bỏ trống nếu không có penalty"
                              />
                            </label>
                            <label className="block text-sm text-gray-300 sm:col-span-2">
                              Số giây phạt
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={resultPenalties[registrationId]?.timePenaltySec ?? ""}
                                onChange={(event) => handlePenaltyChange(registrationId, "timePenaltySec", event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                                placeholder="0"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[28px] border border-white/10 bg-[#0A0D17] p-8 text-center text-gray-400 lg:col-span-2">Không có đăng ký nào để chấm thứ hạng.</div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-[32px] border border-white/10 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(19,28,52,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Danh sách đăng ký</p>
                <h2 className="mt-2 text-2xl font-black text-white">{race.registrations?.length || 0} lượt đăng ký</h2>
              </div>
              <div className="rounded-3xl bg-[#0F1322] px-4 py-3 text-sm text-gray-300">{race.prizeDistribution?.length || 0} bậc phân bổ</div>
            </div>

            <div className="space-y-4">
              {race.registrations?.length ? (
                race.registrations.map((registration) => (
                  <div key={getRegistrationId(registration)} className="rounded-[28px] border border-white/10 bg-[#0A0D17] p-6 relative">
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

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-200">
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Trạng thái jockey: {registration.jockeyResponse?.status || "-"}</span>
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Phê duyệt: {registration.approvalStatus || "-"}</span>
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Payout: {registration.payoutDone ? "Đã trả" : "Chưa"}</span>
                      <span className="inline-flex items-center gap-2 rounded-3xl bg-[#141B2F] px-3 py-2">Bonus: {registration.bonusPaid ? "Đã trả" : "Chưa"}</span>
                      {(race.status === "Locked" || race.status === "Finished") && (
                        <button
                          type="button"
                          onClick={() => openPenaltyModal(registration)}
                          className="inline-flex items-center gap-1.5 rounded-3xl bg-[#8B2D2D] px-3 py-2 text-xs font-bold text-[#FF9C8A] transition hover:bg-[#A33737]"
                        >
                          <AlertTriangle size={14} /> Phạt
                        </button>
                      )}
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

      {leaderboardOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-[32px] border border-white/10 bg-[#0B101A] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9A520]">Bảng xếp hạng</p>
                <h3 className="mt-2 text-2xl font-black text-white">{leaderboardData?.race?.name || race?.name || "Chi tiết race"}</h3>
                {leaderboardData?.race && (
                  <p className="mt-2 text-sm text-gray-400">
                    {leaderboardData.race.location || "-"} - {formatDate(leaderboardData.race.raceDate)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLeaderboardOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Đóng
              </button>
            </div>

            {loadingLeaderboard ? (
              <div className="mt-6 rounded-[28px] border border-white/10 bg-[#111827] p-8 text-center text-gray-400">Đang tải bảng xếp hạng...</div>
            ) : leaderboardError ? (
              <div className="mt-6 rounded-[28px] border border-red-500/20 bg-[#2B1111]/70 p-6 text-red-200">{leaderboardError}</div>
            ) : leaderboardData ? (
              <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Trạng thái</p><p className="mt-1 font-black text-emerald-300">{leaderboardData.race?.status || "-"}</p></div>
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Số ngựa</p><p className="mt-1 font-black text-[#D9A520]">{leaderboardData.participantCount ?? leaderboardData.leaderboard?.length ?? 0}</p></div>
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Cự ly</p><p className="mt-1 font-black text-cyan-300">{leaderboardData.race?.distanceM ? `${leaderboardData.race.distanceM}m` : "-"}</p></div>
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-gray-500">Giải thưởng</p><p className="mt-1 font-black text-white">{leaderboardData.race?.prizeMoney ? leaderboardData.race.prizeMoney.toLocaleString("vi-VN") : "0"}</p></div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
                  <div className="grid grid-cols-[70px_1.3fr_1fr_1fr_1fr_90px] gap-3 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <span>Hạng</span>
                    <span>Ngựa</span>
                    <span>Jockey</span>
                    <span>Owner</span>
                    <span>Tiền</span>
                    <span>Odds</span>
                  </div>
                  {leaderboardData.leaderboard?.length ? (
                    <div className="divide-y divide-white/10">
                      {leaderboardData.leaderboard.map((item) => (
                        <div key={item.horse?._id || item.position} className="grid grid-cols-[70px_1.3fr_1fr_1fr_1fr_90px] gap-3 px-4 py-4 text-sm text-gray-300">
                          <div className="font-black text-[#D9A520]">#{item.rank || item.position || "-"}</div>
                          <div>
                            <p className="font-bold text-white">{item.horse?.name || "-"}</p>
                            <p className="mt-1 text-xs text-gray-500">{item.horse?.registrationNumber || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.jockey?.fullName || "-"}</p>
                            <p className="mt-1 text-xs text-gray-500">Rating: {item.jockey?.rating ?? "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.owner?.stableName || item.owner?.fullName || "-"}</p>
                            <p className="mt-1 text-xs text-gray-500">{item.approvalStatus || "-"}</p>
                          </div>
                          <div className="text-xs text-gray-400">
                            <p>Owner prize: <span className="font-bold text-emerald-300">{formatMoney(item.prizeWon)}</span></p>
                            <p>Jockey hire: <span className="font-bold text-cyan-300">{formatMoney(item.hireFee)}</span></p>
                          </div>
                          <div className="text-xs text-gray-400">
                            <p>T1: {item.oddTop1 ?? 0}</p>
                            <p>T2: {item.oddTop2 ?? 0}</p>
                            <p>T3: {item.oddTop3 ?? 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">Chưa có dữ liệu bảng xếp hạng.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {penaltyModalOpen && penaltyTargetReg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0B101A] p-6 shadow-2xl">
            <div>
              <p className="text-xs font-bold text-[#D9A520]">Phạt Jockey</p>
              <h3 className="mt-2 text-2xl font-black text-white">{penaltyTargetReg.horse?.name || penaltyTargetReg.horse?.registrationNumber || "-"}</h3>
              <p className="mt-2 text-sm text-gray-400">
                Jockey: {penaltyTargetReg.jockey?.fullName || "-"}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Owner: {penaltyTargetReg.owner?.stableName || penaltyTargetReg.owner?.fullName || "-"}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-gray-300">
                Lý do phạt
                <input
                  type="text"
                  value={penaltyReason}
                  onChange={(e) => { setPenaltyReason(e.target.value); setError(null); }}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                  placeholder="Jockey sai vạch xuất phát"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Số giây phạt
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={penaltyTimeSec}
                  onChange={(e) => { setPenaltyTimeSec(e.target.value); setError(null); }}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141B2F] px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                  placeholder="5"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closePenaltyModal}
                disabled={submittingPenalty}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={submitPenalty}
                disabled={submittingPenalty}
                className="rounded-2xl bg-[#8B2D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#A33737] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingPenalty ? "Đang xử lý..." : "Xác nhận phạt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmResultsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#0B101A] p-6 shadow-2xl">
            <div>
              <p className="text-xs font-bold text-[#D9A520]">Xác nhận kết quả</p>
              <h3 className="mt-2 text-2xl font-black text-white">{race?.status === "Finished" ? "Cập nhật kết quả race?" : "Chốt kết quả race?"}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {race?.status === "Finished"
                  ? "Thao tác này sẽ sửa kết quả đã chốt. Vui lòng kiểm tra lại thứ hạng, thời gian và penalty trước khi xác nhận."
                  : "Thao tác này sẽ chia thưởng, trả hireFee và chuyển race sang Finished. Vui lòng kiểm tra lại thứ hạng, thời gian và penalty trước khi xác nhận."}
              </p>
            </div>

            <div className="mt-5 max-h-80 space-y-3 overflow-y-auto rounded-[28px] border border-white/10 bg-[#111827] p-4">
              {pendingResults
                .slice()
                .sort((left, right) => left.rank - right.rank)
                .map((result) => {
                  const registration = race?.registrations?.find((item) => getRegistrationId(item) === result.registrationId);
                  const rankStyle = getWinnerRankStyle(result.rank);
                  const WinnerIcon = rankStyle?.Icon;
                  return (
                    <div key={result.registrationId} className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${rankStyle?.cardClassName || "border-white/10 bg-[#0A0D17]"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${rankStyle?.iconClassName || "bg-white/5 text-gray-400"}`}>
                          {WinnerIcon ? <WinnerIcon size={24} /> : <Trophy size={22} />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">Hạng {result.rank}</p>
                            {rankStyle && <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${rankStyle.badgeClassName}`}>{rankStyle.label}</span>}
                          </div>
                          <p className="mt-1 text-gray-400">Ngựa: {registration?.horse?.name || registration?.horse?.registrationNumber || "-"}</p>
                          <p className="mt-1 text-xs text-gray-500">Jockey: {registration?.jockey?.fullName || "-"}</p>
                          <p className="mt-1 text-xs text-gray-500">Owner: {registration?.owner?.stableName || registration?.owner?.fullName || "-"}</p>
                          <p className="mt-1 text-xs text-gray-500">Finish time: {result.finishTimeSec}s</p>
                          {result.penalty && <p className="mt-1 text-xs text-[#F8E7A1]">Penalty: +{result.penalty.timePenaltySec}s - {result.penalty.reason}</p>}
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${rankStyle?.badgeClassName || "bg-[#D9A520]/15 text-[#F8E7A1]"}`}>#{result.rank}</span>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeResultsConfirm}
                disabled={submittingResults}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={submitRaceResults}
                disabled={submittingResults}
                className="rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black text-black hover:bg-[#f2cb46] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingResults ? "Đang gửi..." : race?.status === "Finished" ? "Xác nhận cập nhật" : "Xác nhận chốt kết quả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereeRaceDetail;
