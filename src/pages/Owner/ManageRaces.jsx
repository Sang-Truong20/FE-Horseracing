import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { ChevronRight } from "lucide-react";
import { alertSuccess, alertFail } from "../../assets/hook/useNotification";

const ManageRaces = () => {
  const [races, setRaces] = useState([]);
  const [status, setStatus] = useState("Open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [ownerHorses, setOwnerHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [form, setForm] = useState({ horseId: "", jockeyId: "", hireFee: "", jockeyBonusPercent: "" });

  const fetchRaces = async (s) => {
    setLoading(true);
    setError(null);
    try {
      const params = s && s !== "All" ? { status: s } : {};
      const res = await api.get("/api/owner/races", { params });
      if (res.data?.status === "Success") {
        setRaces(res.data.data || []);
      } else {
        setError(res.data?.message || "Không lấy được danh sách cuộc đua");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces(status);
    // fetch owner's horses and available jockeys for register form
    const fetchOwnerHorses = async () => {
      try {
        const res = await api.get("/api/owner/horses");
        if (res.data?.status === "Success") setOwnerHorses(res.data.data || []);
      } catch (e) {
        // ignore
      }
    };
    const fetchJockeys = async () => {
      try {
        const res = await api.get("/api/owner/jockeys");
        if (res.data?.status === "Success") setJockeys(res.data.data || []);
      } catch (e) {
        // ignore
      }
    };
    fetchOwnerHorses();
    fetchJockeys();
  }, [status]);

  return (
    <>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Đăng Ký Vào Cuộc Đua</h2>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-black/60 border border-white/10 text-sm rounded-xl px-3 py-2 text-white"
          >
            <option value="All">All</option>
            <option value="Draft">Draft</option>
            <option value="Open">Open</option>
            <option value="Locked">Locked</option>
            <option value="Finished">Finished</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0D1117] rounded-[20px] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Đang tải cuộc đua...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-[10px] uppercase text-gray-600 border-b border-white/5">
                  <th className="px-6 py-3">Tên cuộc đua</th>
                  <th className="px-6 py-3">Ngày giờ</th>
                  <th className="px-6 py-3">Địa điểm</th>
                  <th className="px-6 py-3">Khoảng cách (m)</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Tiền thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {races.map((race) => (
                  <tr key={race._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{race.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{new Date(race.raceDate).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{race.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{race.distanceM}</td>
                    <td className="px-6 py-4 text-sm font-black uppercase text-[#D9A520]">{race.status}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-[#D9A520]">{race.prizeMoney?.toLocaleString() || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRace(race);
                            setForm({ horseId: ownerHorses[0]?._id || "", jockeyId: "", hireFee: "", jockeyBonusPercent: "" });
                            setShowRegisterModal(true);
                          }}
                          className="px-3 py-2 bg-[#D9A520] text-black rounded-xl font-black text-xs"
                        >Đăng ký</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
      {showRegisterModal && selectedRace && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
        <div className="w-full max-w-lg rounded-[24px] bg-[#0B101A] border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-lg font-black text-white">Đăng ký vào: {selectedRace.name}</h3>
            <button onClick={() => setShowRegisterModal(false)} className="text-gray-400">Đóng</button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-[10px] text-gray-400">Chọn ngựa</label>
              <select value={form.horseId} onChange={(e)=>setForm(f=>({...f, horseId:e.target.value}))} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white">
                {ownerHorses.map(h=> <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>

              <label className="text-[10px] text-gray-400">Chọn Jockey</label>
              <select value={form.jockeyId} onChange={(e)=>setForm(f=>({...f,jockeyId:e.target.value}))} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white">
                <option value="">-- Chọn jockey --</option>
                {jockeys.map(j => (
                  <option key={j._id} value={j._id}>{j.fullName || j.username || j.licenseNumber || j._id}</option>
                ))}
              </select>

              <label className="text-[10px] text-gray-400">Hire Fee</label>
              <input type="number" value={form.hireFee} onChange={(e)=>setForm(f=>({...f,hireFee:e.target.value}))} placeholder="hireFee" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white" />

              <label className="text-[10px] text-gray-400">Jockey Bonus %</label>
              <input type="number" value={form.jockeyBonusPercent} onChange={(e)=>setForm(f=>({...f,jockeyBonusPercent:e.target.value}))} placeholder="jockeyBonusPercent" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#04070C]">
            <button onClick={()=>setShowRegisterModal(false)} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5">Hủy</button>
            <button
              onClick={async ()=>{
                try{
                  const payload = {
                    horseId: form.horseId,
                    jockeyId: form.jockeyId,
                    hireFee: Number(form.hireFee)||0,
                    jockeyBonusPercent: Number(form.jockeyBonusPercent)||0,
                  };
                  const res = await api.post(`/api/owner/races/${selectedRace._id}/register`, payload);
                  if(res.data?.status === 'Success' || res.status===201){
                    alertSuccess(res.data?.message || 'Đăng ký thành công');
                    setShowRegisterModal(false);
                    fetchRaces(status);
                  } else {
                    alertFail(res.data?.message || 'Đăng ký thất bại');
                  }
                }catch(err){
                  alertFail(err.response?.data?.message || err.message || 'Lỗi khi đăng ký');
                }
              }}
              className="rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg hover:opacity-90"
            >Đăng ký</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ManageRaces;
