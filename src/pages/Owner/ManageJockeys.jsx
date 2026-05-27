import React, { useEffect, useState } from "react";
import { Users, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../config/axios";
import { alertSuccess, alertFail } from "../../assets/hook/useNotification";

const ManageJockeys = () => {
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJockey, setSelectedJockey] = useState({});
  const [assigning, setAssigning] = useState(null);

  const fetchHorses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/owner/horses");
      if (response.data?.status === "Success") {
        setHorses(response.data.data || []);
      } else {
        setError(response.data?.message || "Không lấy được danh sách ngựa");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  const normalizeJockey = (jockey) => ({
    _id: jockey._id || jockey.id || jockey.jockeyId || jockey.jockey_id || jockey.userId || jockey.ownerId,
    name: jockey.name || jockey.fullName || jockey.hoTen || jockey.username || "Không tên",
    experience:
      jockey.experience ??
      jockey.years ??
      jockey.exp ??
      jockey.experienceYears ??
      jockey.level ??
      "?",
  });

  const fetchJockeys = async () => {
    try {
      const response = await api.get("/api/owner/jockeys");
      if (response.data?.status === "Success") {
        const rawJockeys = response.data?.data || response.data?.jockeys || [];
        const normalized = Array.isArray(rawJockeys)
          ? rawJockeys.map(normalizeJockey)
          : [];
        setJockeys(normalized);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách jockey:", err);
    }
  };

  useEffect(() => {
    fetchHorses();
    fetchJockeys();
  }, []);

  const handleAssignJockey = async (horseId) => {
    if (!selectedJockey[horseId]) {
      alertFail("Vui lòng chọn jockey");
      return;
    }

    setAssigning(horseId);
    try {
      const response = await api.patch(`/api/owner/horses/${horseId}/jockey`, {
        jockeyId: selectedJockey[horseId],
      });

      if (response.data?.status === "Success") {
        alertSuccess("Gắn jockey thành công!");
        fetchHorses();
        setSelectedJockey((prev) => ({ ...prev, [horseId]: "" }));
      } else {
        alertFail(response.data?.message || "Gắn jockey thất bại");
      }
    } catch (err) {
      alertFail(err.response?.data?.message || err.message || "Lỗi khi gắn jockey");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECTION: ASSIGN JOCKEY TO HORSES */}
      <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        {/* Section Header */}
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="bg-blue-500/20 p-3 rounded-2xl">
            <Users size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Gắn Jockey Cho Ngựa</h3>
            <p className="text-xs text-gray-400 mt-1">Chọn jockey phù hợp cho từng con ngựa của bạn</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Đang tải danh sách ngựa...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          ) : horses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Không có ngựa nào. Hãy tạo ngựa trước.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {horses.map((horse) => (
                <div
                  key={horse._id}
                  className="bg-black/30 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Horse Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D9A520] to-[#B8860B] flex items-center justify-center font-bold text-black text-sm shadow-lg">
                          {horse.name?.charAt(0) || "H"}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{horse.name}</p>
                          <p className="text-xs text-gray-500">{horse.breed} • {horse.gender}</p>
                        </div>
                      </div>
                      {horse.currentJockey && (
                        <div className="mt-2 text-xs text-green-400 flex items-center gap-2">
                          <CheckCircle size={14} />
                          Jockey hiện tại: <span className="font-bold">{horse.currentJockey}</span>
                        </div>
                      )}
                    </div>

                    {/* Jockey Select & Button */}
                    <div className="flex items-center gap-3 flex-1">
                      <select
                        value={selectedJockey[horse._id] || ""}
                        onChange={(e) =>
                          setSelectedJockey((prev) => ({
                            ...prev,
                            [horse._id]: e.target.value,
                          }))
                        }
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D9A520]/50 transition-all"
                      >
                        <option value="">Chọn Jockey...</option>
                        {jockeys.map((jockey) => (
                          <option key={jockey._id || jockey.name} value={jockey._id || jockey.name}>
                            {jockey.name} - {jockey.experience} năm
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignJockey(horse._id)}
                        disabled={assigning === horse._id}
                        className="bg-[#D9A520] text-black font-black px-6 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-tighter whitespace-nowrap"
                      >
                        {assigning === horse._id ? "Đang gắn..." : "Gắn ngay"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Lưu ý</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Chỉ gắn jockey cho ngựa có trạng thái "Active" để tham gia các cuộc đua.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Mẹo</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Chọn jockey có kinh nghiệm cao để tăng khả năng chiến thắng của ngựa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJockeys;
