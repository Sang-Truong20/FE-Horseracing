import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { ChevronRight } from "lucide-react";
import { alertSuccess, alertFail } from "../../assets/hook/useNotification";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `₫${Number(value).toLocaleString("vi-VN")}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const ManageRaces = () => {
  const [races, setRaces] = useState([]);
  const [status, setStatus] = useState("Open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [raceHistory, setRaceHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState(null);
  const [ownerHorses, setOwnerHorses] = useState([]);
  const [form, setForm] = useState({ horseId: "", hireFee: "", jockeyBonusPercent: "" });

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

  const fetchRaceHistory = async (raceId) => {
    setHistoryLoading(true);
    setHistoryError(null);
    setRaceHistory(null);
    try {
      const res = await api.get(`/api/owner/races/${raceId}`);
      if (res.data?.status === "Success") {
        setRaceHistory(res.data.data || null);
      } else {
        setHistoryError(res.data?.message || "Không lấy được lịch sử đăng ký");
      }
    } catch (err) {
      setHistoryError(err.response?.data?.message || err.message || "Lỗi khi gọi API lịch sử");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPayoutHistory = async () => {
    setPayoutLoading(true);
    setPayoutError(null);
    try {
      const res = await api.get("/api/owner/race-history");
      if (res.data?.status === "Success") {
        setPayoutHistory(res.data.data || []);
      } else {
        setPayoutError(res.data?.message || "Không lấy được lịch sử trả thưởng");
      }
    } catch (err) {
      setPayoutError(err.response?.data?.message || err.message || "Lỗi khi gọi API lịch sử trả thưởng");
      setPayoutHistory([]);
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces(status);
    fetchPayoutHistory();
    const fetchOwnerHorses = async () => {
      try {
        const res = await api.get("/api/owner/horses");
        if (res.data?.status === "Success") setOwnerHorses(res.data.data || []);
      } catch (e) {
        // ignore
      }
    };
    fetchOwnerHorses();
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
                  <th className="px-6 py-3">Phí tham gia</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Tiền thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {races.map((race) => (
                  <tr key={race._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{race.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(race.raceDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{race.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{race.distanceM}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatCurrency(race.entryFee)}</td>
                    <td className="px-6 py-4 text-sm font-black uppercase text-[#D9A520]">{race.status}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-[#D9A520]">{formatCurrency(race.prizeMoney)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRace(race);
                            setForm({ horseId: ownerHorses[0]?._id || "", hireFee: "", jockeyBonusPercent: "" });
                            setShowRegisterModal(true);
                          }}
                          className="px-3 py-2 bg-[#D9A520] text-black rounded-xl font-black text-xs"
                        >Đăng ký</button>
                        <button
                          onClick={() => {
                            setSelectedRace(race);
                            setShowHistoryModal(true);
                            fetchRaceHistory(race._id);
                          }}
                          className="px-3 py-2 bg-[#1F2937] text-white rounded-xl font-black text-xs border border-white/10 hover:bg-white/5"
                        >Xem lịch sử</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-[#0D1117] rounded-[20px] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-black text-white">Lịch sử trả thưởng</h2>
          <p className="text-sm text-gray-400">Danh sách các race owner đã tham gia và thông tin payout.</p>
        </div>
        {payoutLoading ? (
          <div className="p-6 text-center text-gray-400">Đang tải lịch sử trả thưởng...</div>
        ) : payoutError ? (
          <div className="p-6 text-center text-red-400">{payoutError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-[10px] uppercase text-gray-600 border-b border-white/5">
                  <th className="px-6 py-3">Race</th>
                  <th className="px-6 py-3">Ngày</th>
                  <th className="px-6 py-3">Địa điểm</th>
                  <th className="px-6 py-3">Referee</th>
                  <th className="px-6 py-3">Prize Money</th>
                  <th className="px-6 py-3">My Horse</th>
                  <th className="px-6 py-3">Jockey</th>
                  <th className="px-6 py-3">Hire Fee</th>
                  <th className="px-6 py-3">Bonus %</th>
                  <th className="px-6 py-3">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payoutHistory.length > 0 ? (
                  payoutHistory.map((item) => (
                    <tr key={item.raceId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{item.raceName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(item.raceDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.referee?.fullName || "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#D9A520]">{formatCurrency(item.prizeMoney)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.myEntry?.horse?.name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.myEntry?.jockey?.fullName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatCurrency(item.myEntry?.hireFee)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.myEntry?.jockeyBonusPercent ?? 0}%</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.payout ? formatCurrency(item.payout) : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-6 text-center text-gray-400">Không có lịch sử trả thưởng.</td>
                  </tr>
                )}
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
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black md:col-span-2">Chọn ngựa</label>
              <select value={form.horseId} onChange={(e)=>setForm(f=>({...f, horseId:e.target.value}))} className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white md:col-span-2">
                <option value="">-- Chọn ngựa --</option>
                {ownerHorses.map(h=> <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>

              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Hire Fee</label>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Jockey Bonus %</label>
              <input type="number" value={form.hireFee} onChange={(e)=>setForm(f=>({...f,hireFee:e.target.value}))} placeholder="500000" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <input type="number" value={form.jockeyBonusPercent} onChange={(e)=>setForm(f=>({...f,jockeyBonusPercent:e.target.value}))} placeholder="10" className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#04070C]">
            <button onClick={()=>setShowRegisterModal(false)} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5">Hủy</button>
            <button
              onClick={async ()=>{
                if (!form.horseId) {
                  alertFail('Vui lòng chọn ngựa');
                  return;
                }
                try{
                  const payload = {
                    horseId: form.horseId,
                    hireFee: Number(form.hireFee) || 0,
                    jockeyBonusPercent: Number(form.jockeyBonusPercent) || 0,
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

      {showHistoryModal && selectedRace && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
        <div className="w-full max-w-3xl rounded-[24px] bg-[#0B101A] border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h3 className="text-lg font-black text-white">Lịch sử đăng ký: {selectedRace.name}</h3>
            </div>
            <button onClick={() => setShowHistoryModal(false)} className="text-gray-400">Đóng</button>
          </div>
          <div className="p-6 space-y-4">
            {historyLoading ? (
              <div className="p-6 text-center text-gray-400">Đang tải lịch sử đăng ký...</div>
            ) : historyError ? (
              <div className="p-6 text-center text-red-400">{historyError}</div>
            ) : raceHistory ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-white">
                    <div className="text-xs uppercase text-gray-400">Tổng đăng ký</div>
                    <div className="mt-2 text-2xl font-black">{raceHistory.registrations?.length || 0}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-white">
                    <div className="text-xs uppercase text-gray-400">Trạng thái</div>
                    <div className="mt-2 text-2xl font-black">{raceHistory.status || "-"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-white">
                    <div className="text-xs uppercase text-gray-400">Ngày thi</div>
                    <div className="mt-2 text-2xl font-black">{new Date(raceHistory.raceDate).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 text-[10px] uppercase text-gray-600 border-b border-white/5">
                        <th className="px-4 py-3">Ngựa</th>
                        <th className="px-4 py-3">Jockey</th>
                        <th className="px-4 py-3">Owner</th>
                        <th className="px-4 py-3">Hire Fee</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Jockey</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(raceHistory.participants || raceHistory.registrations)?.length ? (
                        (raceHistory.participants || raceHistory.registrations).map((registration) => (
                          <tr key={registration.registrationId || registration._id || Math.random()} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-200">{registration.horse?.name || registration.horse?.registrationNumber || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-200">{registration.jockey?.fullName || registration.jockey?.name || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-200">{registration.owner?.stableName || registration.owner?.fullName || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-200">{registration.hireFee?.toLocaleString() || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-200">{registration.approvalStatus || registration.status || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-200">{registration.jockeyResponse?.status || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-gray-400">Không có đăng ký nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400">Chưa có dữ liệu lịch sử.</div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ManageRaces;
