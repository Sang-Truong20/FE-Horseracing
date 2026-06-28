import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck2,
  ChevronDown,
  ChevronRight,
  Check,
  Gift,
  LogOut,
  Medal,
  Search,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";
import api from "../../config/axios";
import { loginSuccess, logout } from "../../redux/features/userSlice";

const navItems = [
  { label: "Kết Quả", value: "races" },
  { label: "Jockey", value: "jockeys" },
  { label: "Điểm Danh", value: "checkin" },
  { label: "Đổi Quà", badge: 12 },
  { label: "Điểm Thưởng" },
];

const streakDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const horseDots = ["bg-amber-400", "bg-slate-300", "bg-rose-500", "bg-emerald-400", "bg-cyan-400", "bg-fuchsia-400"];

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const formatRaceDate = (dateString) => {
  if (!dateString) return "Chưa có lịch";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  if (status === "Open") return "Đang mở";
  if (status === "Locked") return "Đã khóa";
  return status || "-";
};

const getBestOdd = (registration) => {
  const odds = [registration.oddTop1, registration.oddTop2, registration.oddTop3].filter((odd) => Number(odd) > 0);
  if (!odds.length) return "Chưa có odds";
  return `${Math.max(...odds)}x`;
};

const getRegistrationId = (registration) => registration?._id || registration?.registrationId;

const predictionTypes = [
  { value: "Top1", label: "Top 1", oddKey: "oddTop1" },
  { value: "Top2", label: "Top 2", oddKey: "oddTop2" },
  { value: "Top3", label: "Top 3", oddKey: "oddTop3" },
];

const predictionStatuses = ["Pending", "Won", "Lost", "Refunded"];

const getPredictionId = (prediction) => prediction?._id || prediction?.predictionId;

const getRaceName = (prediction) => prediction?.race?.name || prediction?.raceName || prediction?.raceId?.name || "Cuộc đua";

const getHorseName = (prediction) => prediction?.registration?.horse?.name || prediction?.horse?.name || prediction?.horseName || prediction?.registrationId?.horse?.name || "Ngựa chưa đặt tên";

const formatPoints = (points) => Number(points || 0).toLocaleString("vi-VN");

const getUserInitials = (user) => {
  const source = user?.fullName || user?.username || user?.email || "U";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
};

const getWinRate = (jockey) => {
  if (!jockey.totalRaces) return 0;
  return Math.round((jockey.totalWins / jockey.totalRaces) * 100);
};

const getJockeyId = (jockey) => jockey?._id || jockey?.jockeyId;

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getWeekCheckInDays = (checkInStatus) => {
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  const streak = checkInStatus?.checkInStreak || 0;

  return streakDays.map((label, index) => ({
    label,
    isToday: index === todayIndex,
    checked: checkInStatus?.checkedInToday ? index <= todayIndex && todayIndex - index < Math.max(streak, 1) : index < todayIndex && todayIndex - index <= streak,
  }));
};

const EndUserHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("races");
  const [races, setRaces] = useState([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [raceError, setRaceError] = useState(null);
  const [jockeys, setJockeys] = useState([]);
  const [loadingJockeys, setLoadingJockeys] = useState(false);
  const [jockeyError, setJockeyError] = useState(null);
  const [followingJockeys, setFollowingJockeys] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followingError, setFollowingError] = useState(null);
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [followLoadingId, setFollowLoadingId] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInError, setCheckInError] = useState(null);
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const [checkInModal, setCheckInModal] = useState(null);
  const [predictionForms, setPredictionForms] = useState({});
  const [predictionSubmittingId, setPredictionSubmittingId] = useState(null);
  const [predictionMessage, setPredictionMessage] = useState(null);
  const [predictionModal, setPredictionModal] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [predictionHistoryStatus, setPredictionHistoryStatus] = useState("");
  const [loadingPredictionHistory, setLoadingPredictionHistory] = useState(false);
  const [predictionHistoryError, setPredictionHistoryError] = useState(null);
  const [currentUser, setCurrentUser] = useState(user || null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(false);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(user || null);
  }, [user]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingCurrentUser(true);
      setCurrentUserError(null);
      try {
        const response = await api.get("/api/auth/me");
        if (response.data?.status === "Success" && response.data?.data) {
          const nextUser = response.data.data;
          const currentToken = token || localStorage.getItem("token")?.replaceAll('"', "");
          setCurrentUser(nextUser);
          dispatch(loginSuccess({ user: nextUser, token: currentToken }));
        } else {
          setCurrentUserError(response.data?.message || "Không thể tải thông tin tài khoản.");
        }
      } catch (error) {
        setCurrentUserError(error.response?.data?.message || "Lỗi khi tải thông tin tài khoản.");
      } finally {
        setLoadingCurrentUser(false);
      }
    };

    fetchCurrentUser();
  }, [dispatch, token]);

  useEffect(() => {
    const fetchRaces = async () => {
      setLoadingRaces(true);
      setRaceError(null);
      try {
        const response = await api.get("/api/enduser/races");
        if (response.data?.status === "Success") {
          setRaces(normalizeArray(response.data.data));
        } else {
          setRaceError(response.data?.message || "Không thể tải danh sách trận đấu.");
        }
      } catch (error) {
        setRaceError(error.response?.data?.message || "Lỗi khi tải danh sách trận đấu.");
      } finally {
        setLoadingRaces(false);
      }
    };

    fetchRaces();
  }, []);

  useEffect(() => {
    if (activeTab !== "jockeys" || jockeys.length) return;

    const fetchJockeys = async () => {
      setLoadingJockeys(true);
      setJockeyError(null);
      try {
        const response = await api.get("/api/enduser/jockeys");
        if (response.data?.status === "Success") {
          setJockeys(normalizeArray(response.data.data));
        } else {
          setJockeyError(response.data?.message || "Không thể tải danh sách jockey.");
        }
      } catch (error) {
        setJockeyError(error.response?.data?.message || "Lỗi khi tải danh sách jockey.");
      } finally {
        setLoadingJockeys(false);
      }
    };

    fetchJockeys();
  }, [activeTab, jockeys.length]);

  useEffect(() => {
    if (activeTab !== "jockeys") return;

    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      setFollowingError(null);
      try {
        const response = await api.get("/api/enduser/following");
        if (response.data?.status === "Success") {
          setFollowingJockeys(normalizeArray(response.data.data));
        } else {
          setFollowingError(response.data?.message || "Không thể tải danh sách đang theo dõi.");
        }
      } catch (error) {
        setFollowingError(error.response?.data?.message || "Lỗi khi tải danh sách đang theo dõi.");
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "checkin") return;

    const fetchCheckInStatus = async () => {
      setLoadingCheckIn(true);
      setCheckInError(null);
      try {
        const response = await api.get("/api/enduser/check-in");
        if (response.data?.status === "Success") {
          setCheckInStatus(response.data.data || null);
        } else {
          setCheckInError(response.data?.message || "Không thể tải trạng thái điểm danh.");
        }
      } catch (error) {
        setCheckInError(error.response?.data?.message || "Lỗi khi tải trạng thái điểm danh.");
      } finally {
        setLoadingCheckIn(false);
      }
    };

    fetchCheckInStatus();
  }, [activeTab]);

  const refreshCheckInStatus = async () => {
    const response = await api.get("/api/enduser/check-in");
    if (response.data?.status === "Success") {
      setCheckInStatus(response.data.data || null);
      return response.data.data || null;
    }
    throw new Error(response.data?.message || "Không thể tải trạng thái điểm danh.");
  };

  const submitCheckIn = async () => {
    setCheckInSubmitting(true);
    setCheckInError(null);
    try {
      const response = await api.post("/api/enduser/check-in");
      if (response.data?.status === "Success") {
        const nextStatus = await refreshCheckInStatus().catch(() => null);
        const nextPoints = response.data?.data?.points ?? response.data?.points ?? nextStatus?.points;
        if (typeof nextPoints !== "undefined") {
          setCurrentUser((current) => (current ? { ...current, points: nextPoints } : current));
        }
        setCheckInModal({
          type: "success",
          title: "Điểm danh thành công",
          message: response.data?.message || "Bạn đã điểm danh thành công.",
          pointsEarned: response.data?.data?.pointsEarned ?? response.data?.pointsEarned ?? 0,
          points: nextPoints ?? checkInStatus?.points ?? 0,
          checkInStreak: response.data?.data?.checkInStreak ?? response.data?.checkInStreak ?? nextStatus?.checkInStreak ?? checkInStatus?.checkInStreak ?? 0,
          totalCheckIns: response.data?.data?.totalCheckIns ?? response.data?.totalCheckIns ?? nextStatus?.totalCheckIns ?? checkInStatus?.totalCheckIns ?? 0,
        });
      } else {
        setCheckInModal({
          type: "error",
          title: "Điểm danh thất bại",
          message: response.data?.message || "Không thể điểm danh.",
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || "Lỗi khi điểm danh.";
      setCheckInModal({
        type: "error",
        title: "Điểm danh thất bại",
        message,
      });
    } finally {
      setCheckInSubmitting(false);
    }
  };

  const followingIds = new Set(followingJockeys.map(getJockeyId));
  const visibleJockeys = showFollowingOnly ? jockeys.filter((jockey) => followingIds.has(getJockeyId(jockey))) : jockeys;

  const followJockey = async (jockey) => {
    const jockeyId = getJockeyId(jockey);
    if (!jockeyId || followingIds.has(jockeyId)) return;

    setFollowLoadingId(jockeyId);
    setJockeyError(null);
    try {
      const response = await api.post(`/api/enduser/follow/${jockeyId}`);
      if (response.data?.status === "Success") {
        setFollowingJockeys((current) => {
          if (current.some((item) => getJockeyId(item) === jockeyId)) return current;
          return [...current, jockey];
        });
      } else {
        setJockeyError(response.data?.message || "Không thể follow jockey này.");
      }
    } catch (error) {
      setJockeyError(error.response?.data?.message || "Lỗi khi follow jockey.");
    } finally {
      setFollowLoadingId(null);
    }
  };

  const openPredictionModal = (race, registration, predictionType = "Top1") => {
    const raceId = race?._id || race?.raceId;
    const registrationId = getRegistrationId(registration);

    if (!raceId || !registrationId) {
      setPredictionMessage({ type: "error", text: "Không tìm thấy mã trận đấu hoặc mã đăng ký." });
      return;
    }

    setPredictionForms((current) => ({
      ...current,
      [registrationId]: {
        stake: "",
        ...current[registrationId],
        predictionType,
      },
    }));
    setPredictionModal({ race, registration });
    setPredictionMessage(null);
  };

  const updatePredictionForm = (registrationId, field, value) => {
    setPredictionForms((current) => ({
      ...current,
      [registrationId]: {
        predictionType: "Top1",
        stake: "",
        ...current[registrationId],
        [field]: value,
      },
    }));
    setPredictionMessage(null);
  };

  const closePredictionModal = () => {
    if (predictionSubmittingId) return;
    setPredictionModal(null);
  };

  const submitPrediction = async () => {
    const race = predictionModal?.race;
    const registration = predictionModal?.registration;
    const raceId = race?._id || race?.raceId;
    const registrationId = getRegistrationId(registration);
    const form = predictionForms[registrationId] || { predictionType: "Top1", stake: "" };
    const stake = Number(form.stake);

    if (!raceId || !registrationId) {
      setPredictionMessage({ type: "error", text: "Không tìm thấy mã trận đấu hoặc mã đăng ký." });
      return;
    }

    if (!Number.isInteger(stake) || stake <= 0) {
      setPredictionMessage({ type: "error", text: "Vui lòng nhập số điểm cược là số nguyên lớn hơn 0." });
      return;
    }

    setPredictionSubmittingId(registrationId);
    setPredictionMessage(null);
    try {
      const response = await api.post(`/api/enduser/races/${raceId}/predict`, {
        registrationId,
        predictionType: form.predictionType || "Top1",
        stake,
      });

      if (response.data?.status === "Success") {
        setPredictionMessage({ type: "success", text: response.data?.message || "Đặt dự đoán thành công." });
        setPredictionModal(null);
        setPredictionForms((current) => ({
          ...current,
          [registrationId]: { predictionType: form.predictionType || "Top1", stake: "" },
        }));
      } else {
        setPredictionMessage({ type: "error", text: response.data?.message || "Không thể đặt dự đoán." });
      }
    } catch (error) {
      setPredictionMessage({ type: "error", text: error.response?.data?.message || "Lỗi khi đặt dự đoán." });
    } finally {
      setPredictionSubmittingId(null);
    }
  };

  const fetchPredictionHistory = async (status = predictionHistoryStatus) => {
    setLoadingPredictionHistory(true);
    setPredictionHistoryError(null);
    try {
      const response = await api.get("/api/enduser/predictions", {
        params: status ? { status } : undefined,
      });
      if (response.data?.status === "Success") {
        setPredictionHistory(normalizeArray(response.data.data));
      } else {
        setPredictionHistoryError(response.data?.message || "Không thể tải lịch sử cược.");
      }
    } catch (error) {
      setPredictionHistoryError(error.response?.data?.message || "Lỗi khi tải lịch sử cược.");
    } finally {
      setLoadingPredictionHistory(false);
    }
  };

  const openPredictionHistory = async () => {
    setHistoryModalOpen(true);
    await fetchPredictionHistory(predictionHistoryStatus);
  };

  const changePredictionHistoryStatus = async (status) => {
    setPredictionHistoryStatus(status);
    await fetchPredictionHistory(status);
  };

  const openUserDetail = () => {
    setUserMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  const displayUser = currentUser || user || {};
  const displayPoints = displayUser.points ?? checkInStatus?.points ?? 0;
  const activeRaceCount = races.filter((race) => race.status === "Open" || race.status === "Locked").length;

  return (
    <div className="min-h-screen bg-[#050311] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-8%] top-20 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0920]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3 rounded-2xl bg-[#12102a] px-3 py-2 ring-1 ring-cyan-400/15">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-[#04111d]">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-sm font-black">THUNDER</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">Track</p>
            </div>
          </div>

          <nav className="hidden flex-1 items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => item.value && setActiveTab(item.value)}
                className={activeTab === item.value ? "rounded-xl bg-cyan-500/15 px-4 py-2 text-sm text-cyan-300 ring-1 ring-cyan-400/30" : "rounded-xl px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"}
              >
                {item.label}
                {item.badge ? (
                  <span className="ml-2 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
              <Search size={16} className="text-slate-500" />
              <span className="text-sm text-slate-500">Tìm kiếm...</span>
            </div>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 rounded-xl bg-amber-400/10 px-3 py-2 text-amber-300 ring-1 ring-amber-300/20">
              <Star size={16} />
              <span className="text-sm font-bold">{loadingCurrentUser ? "..." : formatPoints(displayPoints)} điểm</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-2 text-left hover:bg-white/10"
              >
                {displayUser.avatar ? (
                  <img src={displayUser.avatar} alt={displayUser.fullName || displayUser.username || "User"} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-[#05111c]">
                    {getUserInitials(displayUser)}
                  </span>
                )}
                <ChevronDown size={16} className={userMenuOpen ? "rotate-180 text-cyan-300 transition" : "text-slate-400 transition"} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-14 z-30 w-72 rounded-3xl border border-white/10 bg-[#0b1024] p-4 shadow-2xl ring-1 ring-cyan-400/10">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    {displayUser.avatar ? (
                      <img src={displayUser.avatar} alt={displayUser.fullName || displayUser.username || "User"} className="h-12 w-12 rounded-2xl object-cover" />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-base font-black text-[#05111c]">
                        {getUserInitials(displayUser)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">{displayUser.fullName || displayUser.username || "End User"}</p>
                      <p className="truncate text-xs text-slate-400">{displayUser.email || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm">
                    <div className="flex items-center justify-between"><span className="text-slate-400">Điểm</span><span className="font-black text-amber-300">{formatPoints(displayPoints)}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-400">Hạng</span><span className="font-bold text-cyan-300">{displayUser.membershipLevel || "-"}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-400">Trạng thái</span><span className="font-bold text-emerald-300">{displayUser.status || "-"}</span></div>
                  </div>

                  {currentUserError && <p className="mt-3 rounded-2xl bg-rose-500/10 p-3 text-xs text-rose-200">{currentUserError}</p>}

                  <div className="mt-4 grid gap-2">
                    <button type="button" onClick={openUserDetail} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">
                      Xem chi tiết <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200 hover:bg-rose-500/15">
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:px-6">
        <section className="min-w-0 flex-1">
          {activeTab === "races" ? (
          <>
          <div className="rounded-[32px] border border-white/6 bg-[radial-gradient(circle_at_top,_rgba(24,24,52,0.9),_rgba(5,3,17,0.96))] px-6 py-8 text-center shadow-[0_24px_80px_rgba(7,13,38,0.55)] lg:px-12 lg:py-12">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              {loadingRaces ? "Đang tải trận đấu" : `${activeRaceCount} trận có thể theo dõi`}
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Theo Dõi &amp; Đặt Cược
              <br />
              Cuộc Đua Đua Ngựa
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 md:text-base">
              Xem kết quả trực tiếp, theo dõi jockey yêu thích và tích lũy điểm thưởng hằng ngày.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-black text-[#04111d]">
                Xem Kết Quả Ngay
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold">
                <CalendarCheck2 size={16} />
                Điểm Danh Hôm Nay
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-black">Trận Hôm Nay</h2>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={openPredictionHistory} className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200 hover:bg-amber-300/15">
                <Medal size={16} />
                Lịch sử cược
              </button>
              <button type="button" className="inline-flex items-center gap-1 text-sm text-cyan-300">
                Xem tất cả <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {loadingRaces ? (
              <div className="rounded-[26px] border border-cyan-400/10 bg-[#10203a] p-8 text-center text-slate-400">Đang tải danh sách trận đấu...</div>
            ) : raceError ? (
              <div className="rounded-[26px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-200">{raceError}</div>
            ) : races.length ? (
              <>
              {predictionMessage && (
                <div className={predictionMessage.type === "success" ? "rounded-[26px] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200" : "rounded-[26px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200"}>
                  {predictionMessage.text}
                </div>
              )}
              {races.map((race, raceIndex) => (
                <div key={race._id} className="overflow-hidden rounded-[26px] border border-cyan-400/10 bg-gradient-to-r from-[#132744] to-[#10203a] shadow-[0_20px_60px_rgba(9,21,46,0.45)]">
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-sm font-black text-[#092113]">{String(raceIndex + 1).padStart(2, "0")}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-black">{race.name || "Cuộc đua"}</p>
                        <p className="mt-1 text-xs text-slate-400">{race.location || "Chưa có địa điểm"} - {formatRaceDate(race.raceDate)}</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">{getStatusLabel(race.status)}</span>
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                      {race.registrations?.length ? (
                        race.registrations.map((registration, index) => {
                          const registrationId = getRegistrationId(registration);
                          const isPredicting = predictionSubmittingId === registrationId;
                          const canPredict = race.status === "Open";

                          return (
                          <div key={registrationId} className="rounded-2xl bg-[#0a1120] p-4 text-sm text-slate-200 ring-1 ring-white/5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`${horseDots[index % horseDots.length]} h-2.5 w-2.5 rounded-full`} />
                              <span className="font-bold text-white">{registration.horse?.name || "Ngựa chưa đặt tên"}</span>
                              <span className="text-xs text-slate-500">{registration.jockey?.fullName || "Chưa có jockey"}</span>
                              <span className="font-bold text-amber-300">{getBestOdd(registration)}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {predictionTypes.map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => openPredictionModal(race, registration, type.value)}
                                disabled={!canPredict || isPredicting}
                                className="rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-2 text-xs font-black text-[#1f1303] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isPredicting ? "Đang đặt..." : `Dự đoán ${type.label}`}
                              </button>
                              ))}
                            </div>

                            {!canPredict && <p className="mt-2 text-xs text-slate-500">Chỉ có thể dự đoán khi trận đang mở.</p>}
                          </div>
                          );
                        })
                      ) : (
                        <p className="rounded-xl bg-[#0a1120] px-3 py-2 text-sm text-slate-400 ring-1 ring-white/5">Chưa có đăng ký được duyệt.</p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="inline-flex items-center overflow-hidden rounded-2xl border border-white/8 bg-[#08111f]">
                        <span className="px-4 py-3 text-sm text-slate-400">Số ngựa:</span>
                        <div className="border-l border-white/8 bg-[#0f1830] px-4 py-3 text-center">
                          <p className="text-base font-black text-amber-300">{race.registrations?.length || 0}</p>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Đăng ký</p>
                        </div>
                      </div>
                      <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-[#04111d]">
                        <ShieldCheck size={16} />
                        Xem Chi Tiết Trận
                      </button>
                      <p className="text-sm text-amber-300">Odds Top 1/2/3 được cập nhật theo từng ngựa.</p>
                    </div>
                  </div>
                </div>
              ))}
              </>
            ) : (
              <div className="rounded-[26px] border border-cyan-400/10 bg-[#10203a] p-8 text-center text-slate-400">Hiện chưa có trận đấu nào để theo dõi.</div>
            )}
          </div>

          <div className="mt-10 flex items-center gap-2 text-base font-black">
            <Medal size={16} className="text-amber-300" />
            Trận Có Thể Theo Dõi
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {races.slice(0, 3).map((race) => (
              <div key={race._id} className="rounded-3xl border border-white/6 bg-white/[0.03] p-5 ring-1 ring-inset ring-white/[0.03]">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{getStatusLabel(race.status)}</p>
                <p className="mt-3 text-lg font-black">{race.name || "Cuộc đua"}</p>
                <p className="mt-2 text-sm text-slate-400">{race.location || "Chưa có địa điểm"}</p>
                <p className="mt-4 text-sm font-bold text-emerald-300">{race.registrations?.length || 0} ngựa được duyệt</p>
              </div>
            ))}
            {!loadingRaces && !raceError && !races.length && (
              <div className="rounded-3xl border border-white/6 bg-white/[0.03] p-5 text-sm text-slate-400 ring-1 ring-inset ring-white/[0.03] md:col-span-3">Chưa có trận đấu khả dụng.</div>
            )}
          </div>
          </>
          ) : activeTab === "jockeys" ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-cyan-400/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_rgba(5,3,17,0.96)_48%)] p-8 shadow-[0_24px_80px_rgba(7,13,38,0.55)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                    <UserRound size={16} /> Hồ sơ jockey công khai
                  </div>
                  <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Danh Sách Jockey</h1>
                  <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">Theo dõi kinh nghiệm, số trận, số lần thắng và rating của các jockey đang hoạt động.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                  <p className="text-3xl font-black text-cyan-300">{loadingFollowing ? "..." : followingJockeys.length}</p>
                  <p className="text-xs text-slate-400">Đang follow</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-white">Danh sách jockey</p>
                <p className="mt-1 text-xs text-slate-400">Theo dõi jockey yêu thích để xem nhanh trong danh sách riêng.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowingOnly(false)}
                  className={!showFollowingOnly ? "rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-[#04111d]" : "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"}
                >
                  Tất cả ({jockeys.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowFollowingOnly(true)}
                  className={showFollowingOnly ? "rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#04111d]" : "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"}
                >
                  Đang follow ({followingJockeys.length})
                </button>
              </div>
            </div>

            {followingError && (
              <div className="rounded-[26px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">{followingError}</div>
            )}

            {loadingJockeys ? (
              <div className="rounded-[26px] border border-cyan-400/10 bg-[#10203a] p-8 text-center text-slate-400">Đang tải danh sách jockey...</div>
            ) : jockeyError ? (
              <div className="rounded-[26px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-200">{jockeyError}</div>
            ) : visibleJockeys.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleJockeys.map((jockey, index) => {
                  const jockeyId = getJockeyId(jockey);
                  const isFollowing = followingIds.has(jockeyId);
                  const isFollowLoading = followLoadingId === jockeyId;
                  return (
                  <div key={jockeyId} className="group overflow-hidden rounded-[28px] border border-white/8 bg-[#0b1024] p-5 shadow-[0_20px_60px_rgba(8,14,34,0.35)] ring-1 ring-inset ring-white/[0.03] transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#101933]">
                    <div className="flex items-start gap-4">
                      {jockey.avatar ? (
                        <img src={jockey.avatar} alt={jockey.fullName} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-cyan-400/20" />
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl font-black text-[#04111d] ring-2 ring-cyan-400/20">
                          {(jockey.fullName || "J").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-lg font-black text-white">{jockey.fullName || "Jockey"}</h3>
                          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">#{index + 1}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{jockey.experienceYears || 0} năm kinh nghiệm</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => followJockey(jockey)}
                      disabled={isFollowing || isFollowLoading}
                      className={isFollowing ? "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400/15 px-4 py-3 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/20" : "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-black text-[#04111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"}
                    >
                      {isFollowing ? <Check size={16} /> : <UserRound size={16} />}
                      {isFollowing ? "Đang follow" : isFollowLoading ? "Đang follow..." : "Follow Jockey"}
                    </button>

                    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-xl font-black text-cyan-300">{jockey.totalRaces || 0}</p>
                        <p className="mt-1 text-[11px] text-slate-500">Trận</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-xl font-black text-emerald-300">{jockey.totalWins || 0}</p>
                        <p className="mt-1 text-[11px] text-slate-500">Thắng</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-xl font-black text-amber-300">{jockey.rating || 0}</p>
                        <p className="mt-1 text-[11px] text-slate-500">Rating</p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Tỷ lệ thắng</span>
                        <span className="font-bold text-white">{getWinRate(jockey)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.min(getWinRate(jockey), 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[26px] border border-cyan-400/10 bg-[#10203a] p-8 text-center text-slate-400">{showFollowingOnly ? "Bạn chưa follow jockey nào." : "Hiện chưa có jockey nào."}</div>
            )}
          </div>
          ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-emerald-400/10 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.18),_rgba(5,3,17,0.96)_50%)] p-8 shadow-[0_24px_80px_rgba(7,13,38,0.55)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                    <CalendarCheck2 size={16} /> Điểm danh hằng ngày
                  </div>
                  <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Lịch Điểm Danh</h1>
                  <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">Theo dõi chuỗi điểm danh, điểm thưởng mỗi ngày và thời gian điểm danh tiếp theo.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                  <p className="text-3xl font-black text-emerald-300">{loadingCheckIn ? "..." : checkInStatus?.points ?? 0}</p>
                  <p className="text-xs text-slate-400">Điểm hiện có</p>
                </div>
              </div>
            </div>

            {loadingCheckIn ? (
              <div className="rounded-[26px] border border-emerald-400/10 bg-[#10231c] p-8 text-center text-slate-400">Đang tải trạng thái điểm danh...</div>
            ) : checkInError ? (
              <div className="rounded-[26px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-200">{checkInError}</div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                    <p className="text-sm text-slate-400">Trạng thái hôm nay</p>
                    <p className={checkInStatus?.checkedInToday ? "mt-3 text-2xl font-black text-emerald-300" : "mt-3 text-2xl font-black text-amber-300"}>{checkInStatus?.checkedInToday ? "Đã điểm danh" : "Chưa điểm danh"}</p>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                    <p className="text-sm text-slate-400">Chuỗi hiện tại</p>
                    <p className="mt-3 text-2xl font-black text-cyan-300">{checkInStatus?.checkInStreak || 0} ngày</p>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                    <p className="text-sm text-slate-400">Tổng điểm danh</p>
                    <p className="mt-3 text-2xl font-black text-fuchsia-300">{checkInStatus?.totalCheckIns || 0}</p>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                    <p className="text-sm text-slate-400">Thưởng hôm nay</p>
                    <p className="mt-3 text-2xl font-black text-amber-300">+{checkInStatus?.dailyReward || 0}</p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-emerald-400/10 bg-[#0c1b18] p-6 shadow-[0_20px_60px_rgba(8,34,25,0.35)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black text-white">Lịch tuần này</h2>
                      <p className="mt-1 text-sm text-slate-400">Ngày hiện tại được làm nổi bật, các ngày đã điểm danh có dấu xác nhận.</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">Lần tiếp theo: {formatDateTime(checkInStatus?.nextCheckInAt)}</div>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-3">
                    {getWeekCheckInDays(checkInStatus).map((day) => (
                      <div key={day.label} className="text-center">
                        <div className={day.checked ? "grid h-12 place-items-center rounded-2xl border border-emerald-400/40 bg-emerald-400/15 text-lg font-black text-emerald-300" : day.isToday ? "grid h-12 place-items-center rounded-2xl border border-amber-300/50 bg-amber-300/15 text-lg font-black text-amber-200" : "grid h-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg font-black text-slate-500"}>
                          {day.checked ? "✓" : day.isToday ? "•" : "+"}
                        </div>
                        <p className={day.isToday ? "mt-2 text-xs font-bold text-amber-200" : "mt-2 text-xs text-slate-500"}>{day.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">Lần điểm danh gần nhất: <span className="font-semibold text-white">{formatDateTime(checkInStatus?.lastCheckInAt)}</span></div>
                    <div className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">Nếu chưa điểm danh, hệ thống sẽ mở lượt kế tiếp theo thời gian API trả về.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </section>

        <aside className="w-full shrink-0 lg:w-[320px]">
          <div className="rounded-[28px] border border-fuchsia-400/10 bg-[#120d28] p-5 shadow-[0_22px_60px_rgba(18,13,40,0.55)]">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-bold">
                <Gift size={16} className="text-emerald-300" />
                Điểm Danh Hằng Ngày
              </div>
              <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">7 ngày</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {streakDays.map((day, index) => (
                <div key={day} className="text-center">
                  <div className={index < 6 ? "grid h-8 w-8 place-items-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-xs font-bold text-emerald-300" : "grid h-8 w-8 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-xs font-bold text-cyan-300"}>
                    {index < 6 ? "✓" : "+"}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">{day}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-b from-amber-400/10 to-emerald-400/10 p-4 text-center ring-1 ring-white/6">
              <p className="text-sm text-amber-200">+80 điểm</p>
              <p className="mt-1 text-xs text-slate-400">Phần thưởng hôm nay</p>
              <button type="button" onClick={submitCheckIn} disabled={checkInSubmitting || checkInStatus?.checkedInToday} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-black text-[#062015] disabled:cursor-not-allowed disabled:opacity-60">
                {checkInSubmitting ? "Đang điểm danh..." : checkInStatus?.checkedInToday ? "Đã điểm danh hôm nay" : "Điểm Danh Ngay!"}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500">Thưởng chuỗi 7 ngày - +500 điểm</p>
          </div>

          <div className="mt-5 rounded-[28px] border border-cyan-400/10 bg-[#0e1226] p-5 shadow-[0_22px_60px_rgba(8,14,34,0.45)]">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-bold">
                <Star size={16} className="text-amber-300" />
                Điểm Của Tôi
              </div>
              <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">{displayUser.membershipLevel || "Thành viên"}</span>
            </div>
            <div className="mt-5 rounded-[24px] bg-gradient-to-b from-[#132744] to-[#0b1427] p-5 text-center ring-1 ring-cyan-400/10">
              <p className="text-5xl font-black tracking-tight">{formatPoints(displayPoints)}</p>
              <p className="mt-2 text-sm text-slate-400">Điểm tích lũy</p>
              <div className="mt-5 h-2 rounded-full bg-white/5">
                <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{formatPoints(displayPoints)}</span>
                <span>{displayUser.membershipLevel || "Thành viên"}</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-lg font-black text-emerald-300">+320</p>
                <p className="mt-1 text-[11px] text-slate-500">Tuần này</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-lg font-black text-cyan-300">62%</p>
                <p className="mt-1 text-[11px] text-slate-500">Tỷ lệ thắng</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-lg font-black text-amber-300">3</p>
                <p className="mt-1 text-[11px] text-slate-500">Cược mở</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {checkInModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className={`w-full max-w-md rounded-[32px] border p-6 shadow-2xl ${checkInModal.type === "success" ? "border-emerald-400/20 bg-[#071511]" : "border-rose-400/20 bg-[#17090d]"}`}>
            <p className={`text-xs font-bold uppercase tracking-[0.35em] ${checkInModal.type === "success" ? "text-emerald-300" : "text-rose-300"}`}>{checkInModal.title}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{checkInModal.message}</h3>

            {checkInModal.type === "success" && (
              <div className="mt-5 grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between"><span>Điểm cộng</span><span className="font-black text-amber-300">+{checkInModal.pointsEarned}</span></div>
                <div className="flex items-center justify-between"><span>Điểm hiện có</span><span className="font-black text-cyan-300">{checkInModal.points}</span></div>
                <div className="flex items-center justify-between"><span>Chuỗi hiện tại</span><span className="font-black text-emerald-300">{checkInModal.checkInStreak} ngày</span></div>
                <div className="flex items-center justify-between"><span>Tổng điểm danh</span><span className="font-black text-fuchsia-300">{checkInModal.totalCheckIns}</span></div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCheckInModal(null)}
              className="mt-6 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/15"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {predictionModal && (() => {
        const registration = predictionModal.registration;
        const race = predictionModal.race;
        const registrationId = getRegistrationId(registration);
        const form = predictionForms[registrationId] || { predictionType: "Top1", stake: "" };
        const selectedType = predictionTypes.find((type) => type.value === form.predictionType) || predictionTypes[0];
        const isSubmitting = predictionSubmittingId === registrationId;

        return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="w-full max-w-lg rounded-[32px] border border-amber-300/20 bg-[#0b1020] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">Đặt dự đoán</p>
            <h3 className="mt-2 text-2xl font-black text-white">{race?.name || "Cuộc đua"}</h3>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <p><span className="text-slate-500">Ngựa:</span> <span className="font-bold text-white">{registration?.horse?.name || "Ngựa chưa đặt tên"}</span></p>
              <p className="mt-2"><span className="text-slate-500">Jockey:</span> <span className="font-bold text-white">{registration?.jockey?.fullName || "Chưa có jockey"}</span></p>
              <p className="mt-2"><span className="text-slate-500">Loại cược:</span> <span className="font-bold text-amber-300">{selectedType.label} - {registration?.[selectedType.oddKey] ? `${registration[selectedType.oddKey]}x` : "chưa có odds"}</span></p>
            </div>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Số điểm cần cược
              <input
                type="number"
                min="1"
                step="1"
                value={form.stake}
                onChange={(event) => updatePredictionForm(registrationId, "stake", event.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101a30] px-4 py-3 text-white outline-none focus:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Nhập số điểm"
              />
            </label>

            {predictionMessage?.type === "error" && (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{predictionMessage.text}</div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closePredictionModal} disabled={isSubmitting} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
                Hủy
              </button>
              <button type="button" onClick={submitPrediction} disabled={isSubmitting} className="rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-3 text-sm font-black text-[#1f1303] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Đang cược..." : "Cược"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {historyModalOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-[32px] border border-cyan-300/20 bg-[#08111f] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Lịch sử cược</p>
                <h3 className="mt-2 text-2xl font-black text-white">Danh sách các trận đã cược</h3>
              </div>
              <button type="button" onClick={() => setHistoryModalOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                Đóng
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => changePredictionHistoryStatus("")}
                className={!predictionHistoryStatus ? "rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-[#03131b]" : "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"}
              >
                Tất cả
              </button>
              {predictionStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => changePredictionHistoryStatus(status)}
                  className={predictionHistoryStatus === status ? "rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-[#03131b]" : "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              {loadingPredictionHistory ? (
                <div className="p-8 text-center text-slate-400">Đang tải lịch sử cược...</div>
              ) : predictionHistoryError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{predictionHistoryError}</div>
              ) : predictionHistory.length ? (
                <div className="space-y-3">
                  {predictionHistory.map((prediction, index) => (
                    <div key={getPredictionId(prediction) || index} className="rounded-2xl border border-white/10 bg-[#0b1427] p-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-base font-black text-white">{getRaceName(prediction)}</p>
                          <p className="mt-1 text-slate-400">Ngựa: <span className="font-semibold text-white">{getHorseName(prediction)}</span></p>
                          <p className="mt-1 text-slate-400">Loại cược: <span className="font-semibold text-amber-300">{prediction.predictionType || "-"}</span></p>
                        </div>
                        <span className="w-fit rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200">{prediction.status || "-"}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Điểm cược</p><p className="mt-1 font-black text-amber-300">{prediction.stake ?? "-"}</p></div>
                        <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Odds</p><p className="mt-1 font-black text-cyan-300">{prediction.oddsSnapshot ?? prediction.oddSnapshot ?? prediction.odd ?? "-"}</p></div>
                        <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Thời gian</p><p className="mt-1 font-black text-white">{formatDateTime(prediction.createdAt || prediction.updatedAt)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Chưa có lịch sử cược cho trạng thái này.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndUserHome;
