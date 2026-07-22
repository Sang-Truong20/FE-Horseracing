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
import NotificationMenu from "../../components/NotificationMenu";
import { loginSuccess, logout } from "../../redux/features/userSlice";

const navItems = [
  { label: "Kết Quả", value: "races" },
  { label: "Jockey", value: "jockeys" },
  { label: "Điểm Danh", value: "checkin" },
  { label: "Đổi Quà", value: "gifts" },
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

const getPredictionPayout = (prediction) => prediction?.payout ?? prediction?.payoutAmount ?? prediction?.payoutPoints ?? prediction?.wonAmount;

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
  const [predictionSuccessModal, setPredictionSuccessModal] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [predictionHistoryStatus, setPredictionHistoryStatus] = useState("");
  const [loadingPredictionHistory, setLoadingPredictionHistory] = useState(false);
  const [predictionHistoryError, setPredictionHistoryError] = useState(null);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [currentUser, setCurrentUser] = useState(user || null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(false);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [aiPredictions, setAIPredictions] = useState({});
  const [loadingAIPrediction, setLoadingAIPrediction] = useState(null);
  const [aiPredictionError, setAIPredictionError] = useState(null);
  const [aiPredictionModal, setAIPredictionModal] = useState(null);
  const [aiChatModal, setAIChatModal] = useState(null);
  const [aiChatMessages, setAIChatMessages] = useState({});
  const [aiChatInput, setAIChatInput] = useState("");
  const [loadingAIChat, setLoadingAIChat] = useState(false);
  const [aiChatError, setAIChatError] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [giftsError, setGiftsError] = useState(null);
  const [redeemConfirmModal, setRedeemConfirmModal] = useState(null);
  const [loadingRedeem, setLoadingRedeem] = useState(false);
  const [redeemSuccessModal, setRedeemSuccessModal] = useState(null);
  const [redeemError, setRedeemError] = useState(null);
  const [redemptionHistoryModal, setRedemptionHistoryModal] = useState(false);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [loadingRedemptionHistory, setLoadingRedemptionHistory] = useState(false);
  const [redemptionHistoryError, setRedemptionHistoryError] = useState(null);

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

  useEffect(() => {
    if (activeTab !== "gifts" || gifts.length) return;

    const fetchGifts = async () => {
      setLoadingGifts(true);
      setGiftsError(null);
      try {
        const response = await api.get("/api/enduser/gifts");
        if (response.data?.status === "Success") {
          setGifts(normalizeArray(response.data.data));
        } else {
          setGiftsError(response.data?.message || "Không thể tải danh sách quà.");
        }
      } catch (error) {
        setGiftsError(error.response?.data?.message || "Lỗi khi tải danh sách quà.");
      } finally {
        setLoadingGifts(false);
      }
    };

    fetchGifts();
  }, [activeTab, gifts.length]);

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
        setPredictionSuccessModal({
          title: "Đặt cược thành công",
          message: response.data?.message || "Đặt dự đoán thành công.",
        });
        setPredictionModal(null);
        setPredictionForms((current) => ({
          ...current,
          [registrationId]: { predictionType: form.predictionType || "Top1", stake: "" },
        }));
        setPredictionMessage(null);

        // Refresh user points after successful prediction
        try {
          const userResponse = await api.get("/api/auth/me");
          if (userResponse.data?.status === "Success" && userResponse.data?.data) {
            setCurrentUser(userResponse.data.data);
            const currentToken = token || localStorage.getItem("token")?.replaceAll('"', "");
            dispatch(loginSuccess({ user: userResponse.data.data, token: currentToken }));
          }
        } catch (error) {
          console.error("Failed to refresh user points:", error);
        }
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

  const openRaceLeaderboard = async (race) => {
    const raceId = race?._id || race?.raceId;
    if (!raceId) {
      setLeaderboardError("Không tìm thấy mã trận đấu.");
      setLeaderboardModalOpen(true);
      return;
    }

    setLeaderboardModalOpen(true);
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    setLeaderboardData(null);
    try {
      const response = await api.get(`/api/races/${raceId}/leaderboard`);
      if (response.data?.status === "Success") {
        setLeaderboardData(response.data.data || null);
      } else {
        setLeaderboardError(response.data?.message || "Không thể tải bảng xếp hạng.");
      }
    } catch (error) {
      setLeaderboardError(error.response?.data?.message || "Lỗi khi tải bảng xếp hạng.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const openUserDetail = () => {
    setUserMenuOpen(false);
    navigate("/profile");
  };

  const fetchAIPrediction = async (race) => {
    const raceId = race?._id || race?.raceId;
    if (!raceId) {
      setAIPredictionError("Không tìm thấy mã trận đấu.");
      return;
    }

    setLoadingAIPrediction(raceId);
    setAIPredictionError(null);
    try {
      const response = await api.get(`/api/races/${raceId}/ai-predict`);
      if (response.data?.status === "Success" && response.data?.data) {
        const data = response.data.data;
        setAIPredictions((current) => ({
          ...current,
          [raceId]: data,
        }));
        setAIPredictionModal({
          race: data.race || race,
          predictions: data.predictions || [],
          aiAnalysis: data.aiAnalysis || "",
          disclaimer: data.disclaimer || "",
        });
      } else {
        setAIPredictionError(response.data?.message || "Không thể tải dự đoán AI.");
      }
    } catch (error) {
      setAIPredictionError(error.response?.data?.message || "Lỗi khi tải dự đoán AI.");
    } finally {
      setLoadingAIPrediction(null);
    }
  };

  const openAIChat = (race) => {
    const raceId = race?._id || race?.raceId;
    if (!raceId) {
      setAIChatError("Không tìm thấy mã trận đấu.");
      return;
    }

    if (!aiChatMessages[raceId]) {
      setAIChatMessages((current) => ({
        ...current,
        [raceId]: [],
      }));
    }
    setAIChatModal({ race });
    setAIChatInput("");
    setAIChatError(null);
  };

  const sendAIChatMessage = async () => {
    const race = aiChatModal?.race;
    const raceId = race?._id || race?.raceId;
    const message = aiChatInput.trim();

    if (!raceId) {
      setAIChatError("Không tìm thấy mã trận đấu.");
      return;
    }

    if (!message) {
      setAIChatError("Vui lòng nhập câu hỏi.");
      return;
    }

    setLoadingAIChat(true);
    setAIChatError(null);

    try {
      const currentMessages = aiChatMessages[raceId] || [];
      const history = currentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await api.post(`/api/races/${raceId}/ai-chat`, {
        message,
        history,
      });

      if (response.data?.status === "Success" && response.data?.data) {
        const data = response.data.data;

        setAIChatMessages((current) => {
          const messages = [...(current[raceId] || [])];
          messages.push({ role: "user", content: message });
          messages.push({ role: "assistant", content: data.reply });
          return {
            ...current,
            [raceId]: messages,
          };
        });
        setAIChatInput("");
      } else {
        setAIChatError(response.data?.message || "Không thể tải phản hồi từ AI.");
      }
    } catch (error) {
      setAIChatError(error.response?.data?.message || "Lỗi khi gọi AI chat.");
    } finally {
      setLoadingAIChat(false);
    }
  };

  const closeAIChat = () => {
    setAIChatModal(null);
    setAIChatInput("");
    setAIChatError(null);
  };

  const openRedeemConfirm = (gift) => {
    setRedeemConfirmModal(gift);
    setRedeemError(null);
  };

  const closeRedeemConfirm = () => {
    if (loadingRedeem) return;
    setRedeemConfirmModal(null);
    setRedeemError(null);
  };

  const submitRedeem = async () => {
    const gift = redeemConfirmModal;
    const giftId = gift?._id;

    if (!giftId) {
      setRedeemError("Không tìm thấy mã quà.");
      return;
    }

    setLoadingRedeem(true);
    setRedeemError(null);
    try {
      const response = await api.post(`/api/enduser/gifts/${giftId}/redeem`);

      if (response.data?.status === "Success" && response.data?.data) {
        const data = response.data.data;
        const redemptionCode = data.redemption?.code || data.code || data.redeemCode || "";
        
        setRedeemSuccessModal({
          gift: gift,
          code: redemptionCode,
          remainingPoints: data.remainingPoints,
        });
        setRedeemConfirmModal(null);

        // Refresh user points
        try {
          const userResponse = await api.get("/api/auth/me");
          if (userResponse.data?.status === "Success" && userResponse.data?.data) {
            setCurrentUser(userResponse.data.data);
            const currentToken = token || localStorage.getItem("token")?.replaceAll('"', "");
            dispatch(loginSuccess({ user: userResponse.data.data, token: currentToken }));
          }
        } catch (error) {
          console.error("Failed to refresh user points:", error);
        }

        // Refresh gifts list
        try {
          const giftsResponse = await api.get("/api/enduser/gifts");
          if (giftsResponse.data?.status === "Success") {
            setGifts(normalizeArray(giftsResponse.data.data));
          }
        } catch (error) {
          console.error("Failed to refresh gifts list:", error);
        }
      } else {
        setRedeemError(response.data?.message || "Không thể đổi quà.");
      }
    } catch (error) {
      setRedeemError(error.response?.data?.message || "Lỗi khi đổi quà.");
    } finally {
      setLoadingRedeem(false);
    }
  };

  const openRedemptionHistory = async () => {
    setRedemptionHistoryModal(true);
    setLoadingRedemptionHistory(true);
    setRedemptionHistoryError(null);
    try {
      const response = await api.get("/api/enduser/redemptions");
      if (response.data?.status === "Success") {
        setRedemptionHistory(normalizeArray(response.data.data));
      } else {
        setRedemptionHistoryError(response.data?.message || "Không thể tải lịch sử đổi quà.");
      }
    } catch (error) {
      setRedemptionHistoryError(error.response?.data?.message || "Lỗi khi tải lịch sử đổi quà.");
    } finally {
      setLoadingRedemptionHistory(false);
    }
  };

  const closeRedemptionHistory = () => {
    setRedemptionHistoryModal(false);
    setRedemptionHistory([]);
    setRedemptionHistoryError(null);
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
            <NotificationMenu
              buttonClassName="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              unreadDotClassName="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-rose-500 px-1 text-[10px] font-black leading-none text-white flex items-center justify-center"
              panelClassName="right-0"
            />
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
              {predictionMessage?.type === "error" && (
                <div className="rounded-[26px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
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
                          const canPredict = race.status === "Open" || race.status === "Locked";

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

                            {!canPredict && <p className="mt-2 text-xs text-slate-500">Chỉ có thể dự đoán khi trận đang mở hoặc đã khóa.</p>}
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
                      <button
                        type="button"
                        onClick={() => fetchAIPrediction(race)}
                        disabled={loadingAIPrediction === race._id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 px-5 py-3 text-sm font-black text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span>🤖</span>
                        {loadingAIPrediction === race._id ? "Đang dự đoán..." : "Dự Đoán AI"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openAIChat(race)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 px-5 py-3 text-sm font-black text-white hover:opacity-90"
                      >
                        <span>💬</span>
                        Hỏi AI
                      </button>
                      <button type="button" onClick={() => openRaceLeaderboard(race)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-[#04111d]">
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
          ) : activeTab === "gifts" ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-fuchsia-400/10 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_rgba(5,3,17,0.96)_48%)] p-8 shadow-[0_24px_80px_rgba(7,13,38,0.55)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm text-fuchsia-300">
                    <Gift size={16} /> Đổi quà thưởng
                  </div>
                  <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Cửa Hàng Quà Tặng</h1>
                  <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">Dùng điểm thưởng của bạn để đổi các quà tặng hấp dẫn — thẻ quà, voucher, và nhiều ưu đãi khác.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                    <p className="text-3xl font-black text-fuchsia-300">{loadingGifts ? "..." : gifts.length}</p>
                    <p className="text-xs text-slate-400">Quà có sẵn</p>
                  </div>
                  <button
                    type="button"
                    onClick={openRedemptionHistory}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-sm font-bold text-fuchsia-200 hover:bg-fuchsia-300/15"
                  >
                    📜 Lịch Sử Đổi Quà
                  </button>
                </div>
              </div>
            </div>

            {loadingGifts ? (
              <div className="rounded-[26px] border border-fuchsia-400/10 bg-[#1a0d28] p-8 text-center text-slate-400">Đang tải danh sách quà...</div>
            ) : giftsError ? (
              <div className="rounded-[26px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-200">{giftsError}</div>
            ) : gifts.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {gifts.map((gift) => (
                  <div key={gift._id} className="group overflow-hidden rounded-[28px] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-400/10 to-purple-600/5 p-6 shadow-[0_20px_60px_rgba(168,85,247,0.15)] ring-1 ring-inset ring-fuchsia-400/10 transition hover:-translate-y-1 hover:border-fuchsia-300/40 hover:shadow-[0_24px_80px_rgba(168,85,247,0.25)]">
                    {gift.imageUrl ? (
                      <img src={gift.imageUrl} alt={gift.name} className="h-40 w-full rounded-2xl object-cover mb-4" />
                    ) : (
                      <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-fuchsia-400/20 to-purple-600/10 mb-4 flex items-center justify-center border border-fuchsia-300/20">
                        <Gift size={32} className="text-fuchsia-300/50" />
                      </div>
                    )}

                    <h3 className="text-lg font-black text-white">{gift.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{gift.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/[0.06] p-3 border border-white/10">
                        <p className="text-xs text-slate-500">Giá đổi</p>
                        <p className="mt-2 text-lg font-black text-fuchsia-300">{gift.pointsCost?.toLocaleString("vi-VN") || 0}</p>
                        <p className="text-[10px] text-slate-500">điểm</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.06] p-3 border border-white/10">
                        <p className="text-xs text-slate-500">Còn lại</p>
                        <p className="mt-2 text-lg font-black text-emerald-300">{gift.quantity || 0}</p>
                        <p className="text-[10px] text-slate-500">cái</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openRedeemConfirm(gift)}
                      disabled={!gift.quantity || displayPoints < gift.pointsCost}
                      className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-black transition ${
                        displayPoints >= gift.pointsCost && gift.quantity
                          ? "bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white hover:opacity-90"
                          : "bg-slate-600/30 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {displayPoints < gift.pointsCost ? "Điểm không đủ" : !gift.quantity ? "Hết hàng" : "Đổi Quà"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[26px] border border-fuchsia-400/10 bg-[#1a0d28] p-8 text-center text-slate-400">Hiện chưa có quà nào.</div>
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

      {leaderboardModalOpen && (
        <div className="fixed inset-0 z-[74] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-[32px] border border-cyan-300/20 bg-[#08111f] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Bảng xếp hạng</p>
                <h3 className="mt-2 text-2xl font-black text-white">{leaderboardData?.race?.name || "Chi tiết trận đấu"}</h3>
                {leaderboardData?.race && (
                  <p className="mt-2 text-sm text-slate-400">
                    {leaderboardData.race.location || "Chưa có địa điểm"} - {formatRaceDate(leaderboardData.race.raceDate)}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setLeaderboardModalOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                Đóng
              </button>
            </div>

            {loadingLeaderboard ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">Đang tải bảng xếp hạng...</div>
            ) : leaderboardError ? (
              <div className="mt-6 rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{leaderboardError}</div>
            ) : leaderboardData ? (
              <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Trạng thái</p><p className="mt-1 font-black text-emerald-300">{leaderboardData.race?.status || "-"}</p></div>
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Số ngựa</p><p className="mt-1 font-black text-amber-300">{leaderboardData.participantCount ?? leaderboardData.leaderboard?.length ?? 0}</p></div>
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Cự ly</p><p className="mt-1 font-black text-cyan-300">{leaderboardData.race?.distanceM ? `${leaderboardData.race.distanceM}m` : "-"}</p></div>
                  <div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Giải thưởng</p><p className="mt-1 font-black text-white">{leaderboardData.race?.prizeMoney ? leaderboardData.race.prizeMoney.toLocaleString("vi-VN") : "0"}</p></div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
                  <div className="grid grid-cols-[70px_1.4fr_1fr_1fr_90px] gap-3 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Hạng</span>
                    <span>Ngựa</span>
                    <span>Jockey</span>
                    <span>Owner</span>
                    <span>Odds</span>
                  </div>
                  {leaderboardData.leaderboard?.length ? (
                    <div className="divide-y divide-white/10">
                      {leaderboardData.leaderboard.map((item) => (
                        <div key={item.horse?._id || item.position} className="grid grid-cols-[70px_1.4fr_1fr_1fr_90px] gap-3 px-4 py-4 text-sm text-slate-300">
                          <div className="font-black text-amber-300">#{item.rank || item.position || "-"}</div>
                          <div>
                            <p className="font-bold text-white">{item.horse?.name || "Ngựa chưa đặt tên"}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.horse?.registrationNumber || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.jockey?.fullName || "-"}</p>
                            <p className="mt-1 text-xs text-slate-500">Rating: {item.jockey?.rating ?? "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.owner?.stableName || item.owner?.fullName || "-"}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.approvalStatus || "-"}</p>
                          </div>
                          <div className="text-xs text-slate-400">
                            <p>T1: {item.oddTop1 ?? 0}</p>
                            <p>T2: {item.oddTop2 ?? 0}</p>
                            <p>T3: {item.oddTop3 ?? 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">Chưa có dữ liệu bảng xếp hạng.</div>
                  )}
                </div>
              </div>
            ) : null}
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

      {predictionSuccessModal && (
        <div className="fixed inset-0 z-[81] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="w-full max-w-md rounded-[32px] border border-emerald-400/20 bg-[#071511] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">Thành công</p>
            <h3 className="mt-2 text-2xl font-black text-white">{predictionSuccessModal.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">{predictionSuccessModal.message}</p>
            <button
              type="button"
              onClick={() => setPredictionSuccessModal(null)}
              className="mt-6 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/15"
            >
              OK
            </button>
          </div>
        </div>
      )}

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
                        <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Tiền trả thưởng</p><p className="mt-1 font-black text-emerald-300">{getPredictionPayout(prediction) != null ? `${formatPoints(getPredictionPayout(prediction))} điểm` : "-"}</p></div>
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

      {aiPredictionModal && (() => {
        const raceData = aiPredictionModal.race || aiPredictionModal.predictions?.[0]?.race;
        const predictions = aiPredictionModal.predictions || [];
        const aiAnalysis = aiPredictionModal.aiAnalysis;
        const disclaimer = aiPredictionModal.disclaimer;

        return (
          <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 px-4 py-8">
            <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-[32px] border border-purple-300/20 bg-[#0b1020] p-6 shadow-2xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-xs font-bold text-purple-300">
                    <span>🤖</span>
                    Dự Đoán AI
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{raceData?.name || "Cuộc đua"}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span>📍 {raceData?.location || "Chưa có địa điểm"}</span>
                    <span>📅 {formatRaceDate(raceData?.raceDate)}</span>
                    {raceData?.distanceM && <span>📏 {raceData.distanceM}m</span>}
                  </div>
                </div>
                <button type="button" onClick={() => setAIPredictionModal(null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                  Đóng
                </button>
              </div>

              {aiPredictionError && (
                <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{aiPredictionError}</div>
              )}

              {predictions && Array.isArray(predictions) && predictions.length > 0 ? (
                <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
                  {/* Predictions List */}
                  {predictions.map((prediction, index) => (
                    <div key={index} className="rounded-[24px] border border-purple-400/20 bg-purple-400/5 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Horse & Jockey Info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`${horseDots[index % horseDots.length]} h-3 w-3 rounded-full`} />
                            <h4 className="text-lg font-black text-white">{prediction.horse?.name || "Ngựa"}</h4>
                            <span className="text-sm text-slate-400">{prediction.jockey?.fullName || "Jockey"}</span>
                          </div>

                          {/* Stats Grid */}
                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-white/[0.06] p-3 border border-white/10">
                              <p className="text-xs text-slate-500">Tỷ Lệ Thắng</p>
                              <p className="mt-2 text-2xl font-black text-cyan-300">{prediction.predictedWinPercent?.toFixed(1) || 0}%</p>
                            </div>
                            <div className="rounded-xl bg-white/[0.06] p-3 border border-white/10">
                              <p className="text-xs text-slate-500">Lịch Sử Ngựa</p>
                              <p className="mt-2 text-2xl font-black text-amber-300">{prediction.horseWinRatePercent?.toFixed(1) || 0}%</p>
                            </div>
                            <div className="rounded-xl bg-white/[0.06] p-3 border border-white/10">
                              <p className="text-xs text-slate-500">Jockey</p>
                              <p className="mt-2 text-2xl font-black text-emerald-300">{prediction.jockeyWinRatePercent?.toFixed(1) || 0}%</p>
                            </div>
                            <div className="rounded-xl bg-white/[0.06] p-3 border border-white/10">
                              <p className="text-xs text-slate-500">Phong Độ/Thể Chất</p>
                              <p className="mt-2 text-lg font-black text-fuchsia-300">
                                {prediction.recentFormPercent?.toFixed(1) || 0}%
                                <span className="text-xs text-slate-400"> / {prediction.physicalPercent?.toFixed(1) || 0}%</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ranking Badge */}
                        <div className="flex-shrink-0 lg:mt-0">
                          <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 p-4 text-center">
                            <p className="text-xs font-bold text-white">Xếp Hạng</p>
                            <p className="mt-2 text-4xl font-black text-white">#{index + 1}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* AI Analysis Section */}
                  {aiAnalysis && (
                    <div className="mt-6 rounded-[24px] border border-purple-400/30 bg-gradient-to-br from-purple-400/10 to-purple-600/5 p-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-2xl">🔍</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300">Phân Tích Chi Tiết Từ AI</p>
                          <div className="mt-4 text-sm leading-relaxed text-slate-300 prose-invert max-w-none">
                            {aiAnalysis.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-3">
                                {paragraph.split('\n').map((line, lineIdx) => (
                                  <span key={lineIdx}>
                                    {line}
                                    {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                  </span>
                                ))}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="mt-4 rounded-[24px] border border-amber-400/20 bg-amber-400/5 p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">⚠️</div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Lưu Ý Quan Trọng</p>
                        <p className="mt-2 text-sm text-slate-400">
                          {disclaimer || "Dự đoán chỉ mang tính chất tham khảo, dựa trên dữ liệu lịch sử. Đua ngựa có yếu tố ngẫu nhiên và không đảm bảo chính xác 100%."}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          <strong>Công thức tính:</strong> Tỷ lệ thắng lịch sử ngựa (50%) + Jockey (30%) + Phong độ/Thể trạng (20%) - Laplace smoothed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-8 text-center text-slate-400">Không có dữ liệu dự đoán.</div>
              )}
            </div>
          </div>
        );
      })()}

      {aiChatModal && (() => {
        const race = aiChatModal.race;
        const raceId = race?._id || race?.raceId;
        const messages = aiChatMessages[raceId] || [];

        return (
          <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 px-4 py-8">
            <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-[32px] border border-cyan-300/20 bg-[#0b1020] p-6 shadow-2xl">
              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                    <span>💬</span>
                    AI Chat
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{race?.name || "Cuộc đua"}</h3>
                  <p className="mt-1 text-sm text-slate-400">Hỏi đáp về dự đoán và thông tin trận đấu</p>
                </div>
                <button type="button" onClick={closeAIChat} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                  Đóng
                </button>
              </div>

              {/* Messages Area */}
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/10 bg-white/[0.03] p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl">💬</p>
                      <p className="mt-3 text-sm text-slate-400">Hãy đặt câu hỏi về trận đấu này.</p>
                      <p className="mt-2 text-xs text-slate-500">Ví dụ: "Con ngựa nào có khả năng về nhất?"</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 mt-1 ${msg.role === "user" ? "text-amber-400" : "text-cyan-400"}`}>
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full border ${msg.role === "user" ? "bg-amber-400/10 border-amber-400/30" : "bg-cyan-400/10 border-cyan-400/30"}`}>
                          {msg.role === "user" ? "👤" : "🤖"}
                        </div>
                      </div>

                      {/* Message */}
                      <div className={`max-w-xs ${msg.role === "user" ? "lg:max-w-md" : "lg:max-w-lg"}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-amber-400/15 text-amber-50 border border-amber-400/20" : "bg-cyan-400/10 text-slate-200 border border-cyan-400/20"}`}>
                          {msg.content.split('\n').map((line, lineIdx) => (
                            <span key={lineIdx}>
                              {line}
                              {lineIdx < msg.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {loadingAIChat && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1 text-cyan-400">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                        <span className="animate-pulse">🤖</span>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-cyan-400/10 px-4 py-3 border border-cyan-400/20">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0s" }} />
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}

                {aiChatError && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{aiChatError}</div>
                )}
              </div>

              {/* Input Area */}
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => {
                      setAIChatInput(e.target.value);
                      setAIChatError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !loadingAIChat) {
                        sendAIChatMessage();
                      }
                    }}
                    disabled={loadingAIChat}
                    placeholder="Nhập câu hỏi..."
                    className="flex-1 rounded-2xl border border-white/10 bg-[#101a30] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={sendAIChatMessage}
                    disabled={loadingAIChat || !aiChatInput.trim()}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingAIChat ? "..." : "Gửi"}
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-slate-500">
                  💡 AI trả lời dựa trên dữ liệu dự đoán của trận đấu này. Kết quả chỉ mang tính tham khảo.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {redemptionHistoryModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-[32px] border border-fuchsia-300/20 bg-[#0b1020] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-fuchsia-300">Lịch Sử Đổi Quà</p>
                <h3 className="mt-2 text-2xl font-black text-white">Danh Sách Mã Code</h3>
              </div>
              <button type="button" onClick={closeRedemptionHistory} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                Đóng
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              {loadingRedemptionHistory ? (
                <div className="p-8 text-center text-slate-400">Đang tải lịch sử đổi quà...</div>
              ) : redemptionHistoryError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{redemptionHistoryError}</div>
              ) : redemptionHistory.length ? (
                <div className="space-y-3">
                  {redemptionHistory.map((redemption, index) => (
                    <div key={redemption._id || index} className="rounded-2xl border border-fuchsia-300/20 bg-gradient-to-r from-fuchsia-400/5 to-purple-600/5 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-fuchsia-300">{redemption.giftName || "Quà tặng"}</h4>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              redemption.status === "Issued" 
                                ? "bg-emerald-400/20 text-emerald-300"
                                : "bg-slate-500/20 text-slate-300"
                            }`}>
                              {redemption.status || "Unknown"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">{redemption.description}</p>
                          <p className="mt-2 text-xs text-slate-500">🕐 {formatDateTime(redemption.redeemedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-[#101a30] p-3 border border-fuchsia-300/30">
                        <p className="text-xs text-slate-500 mb-1">Mã Code</p>
                        <p className="text-sm font-mono font-black text-fuchsia-300 tracking-wide">{redemption.code}</p>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>💰 {redemption.pointsPaid?.toLocaleString("vi-VN") || 0} điểm</span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(redemption.code)}
                          className="rounded px-2 py-1 hover:bg-white/10 text-fuchsia-300 hover:text-fuchsia-200"
                        >
                          Sao Chép
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Bạn chưa đổi quà nào.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {redeemConfirmModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="w-full max-w-md rounded-[32px] border border-fuchsia-300/20 bg-[#0b1020] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-fuchsia-300">Xác nhận đổi quà</p>
            <h3 className="mt-2 text-2xl font-black text-white">{redeemConfirmModal?.name || "Quà tặng"}</h3>
            
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Giá đổi:</span>
                <span className="text-lg font-black text-fuchsia-300">{redeemConfirmModal?.pointsCost?.toLocaleString("vi-VN") || 0} điểm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Điểm hiện tại:</span>
                <span className="text-lg font-black text-cyan-300">{displayPoints?.toLocaleString("vi-VN") || 0} điểm</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <span className="text-sm text-slate-400">Sẽ còn lại:</span>
                <span className="ml-2 text-lg font-black text-emerald-300">
                  {(displayPoints - (redeemConfirmModal?.pointsCost || 0))?.toLocaleString("vi-VN") || 0} điểm
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-amber-400/20 bg-amber-400/5 p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5">ℹ️</span>
                <div>
                  <p className="text-sm font-bold text-amber-300">Mã Code sẽ được gửi ngay lập tức</p>
                  <p className="mt-1 text-xs text-slate-400">Bạn sẽ nhận được mã 10 ký tự (4 chữ + 6 số) để sử dụng quà tặng này.</p>
                </div>
              </div>
            </div>

            {redeemError && (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{redeemError}</div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button 
                type="button" 
                onClick={closeRedeemConfirm} 
                disabled={loadingRedeem} 
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button 
                type="button" 
                onClick={submitRedeem} 
                disabled={loadingRedeem} 
                className="rounded-2xl bg-gradient-to-r from-fuchsia-400 to-pink-500 px-5 py-3 text-sm font-black text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingRedeem ? "Đang xử lý..." : "Xác nhận Đổi Quà"}
              </button>
            </div>
          </div>
        </div>
      )}

      {redeemSuccessModal && (
        <div className="fixed inset-0 z-[81] flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="w-full max-w-md rounded-[32px] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/5 to-emerald-600/5 p-6 shadow-2xl">
            <div className="text-center">
              <p className="text-4xl">🎉</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">Đổi quà thành công</p>
              <h3 className="mt-2 text-2xl font-black text-white">{redeemSuccessModal?.gift?.name || "Quà tặng"}</h3>
            </div>

            <div className="mt-6 rounded-[24px] border border-cyan-300/30 bg-cyan-400/10 p-6">
              <p className="text-center text-sm text-slate-400">Mã Code của bạn</p>
              <div className="mt-4 rounded-2xl bg-[#101a30] p-4 border border-cyan-300/20">
                <p className="text-center text-2xl font-mono font-black text-cyan-300 tracking-widest">
                  {redeemSuccessModal?.code}
                </p>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">10 ký tự (4 chữ + 6 số)</p>
            </div>

            <div className="mt-4 rounded-[24px] border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-sm font-bold text-amber-300">Điểm còn lại</p>
              <p className="mt-2 text-2xl font-black text-amber-300">{redeemSuccessModal?.remainingPoints?.toLocaleString("vi-VN") || 0} điểm</p>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(redeemSuccessModal?.code);
                setRedeemSuccessModal(null);
              }}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-black text-white hover:opacity-90"
            >
              Sao Chép Mã & Đóng
            </button>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400 space-y-2">
              <p>✅ Quà đã được cộng vào tài khoản của bạn</p>
              <p>✅ Hãy lưu mã này ở nơi an toàn</p>
              <p>✅ Mã có thể được dùng để nhận quà thực tế</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndUserHome;
