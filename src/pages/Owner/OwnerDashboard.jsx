import React, { useEffect, useState } from "react";
import { Trophy, MoreHorizontal, Eye, Edit3, ChevronRight } from "lucide-react";
import api from "../../config/axios";
import { alertSuccess, alertFail } from "../../assets/hook/useNotification";

const initialHorseForm = {
  name: "",
  breed: "",
  color: "",
  gender: "",
  dateOfBirth: "",
  weightKg: "",
  heightCm: "",
  registrationNumber: "",
  status: "Active",
  notes: "",
};

const editableFields = [
  "name",
  "breed",
  "color",
  "gender",
  "dateOfBirth",
  "weightKg",
  "heightCm",
  "registrationNumber",
  "status",
  "notes",
];

const detailFields = [
  { key: "name", label: "Tên ngựa" },
  { key: "breed", label: "Giống loài" },
  { key: "color", label: "Màu sắc" },
  { key: "gender", label: "Giới tính" },
  { key: "dateOfBirth", label: "Ngày sinh" },
  { key: "weightKg", label: "Cân nặng (kg)" },
  { key: "heightCm", label: "Chiều cao (cm)" },
  { key: "registrationNumber", label: "Mã đăng ký" },
  { key: "status", label: "Trạng thái" },
  { key: "notes", label: "Ghi chú" },
];

const toDateInputValue = (value) => {
  if (!value) return "";
  return value.split("T")[0];
};

const mapHorseToForm = (horse) => ({
  name: horse.name || "",
  breed: horse.breed || "",
  color: horse.color || "",
  gender: horse.gender || "",
  dateOfBirth: toDateInputValue(horse.dateOfBirth),
  weightKg: horse.weightKg ?? "",
  heightCm: horse.heightCm ?? "",
  registrationNumber: horse.registrationNumber || "",
  status: horse.status || "Active",
  notes: horse.notes || "",
});

const buildHorsePayload = (form) =>
  editableFields.reduce((payload, field) => {
    payload[field] = ["weightKg", "heightCm"].includes(field)
      ? Number(form[field]) || 0
      : form[field];
    return payload;
  }, {});

const formatHorseDetailValue = (key, value) => {
  if (!value && value !== 0) return "-";
  if (key === "dateOfBirth") return toDateInputValue(value);
  return value;
};

const OwnerDashboard = () => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedHorseId, setSelectedHorseId] = useState(null);
  const [selectedHorseDetail, setSelectedHorseDetail] = useState(null);
  const [horseForm, setHorseForm] = useState(initialHorseForm);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);

  const filteredHorses = statusFilter === "All"
    ? horses
    : horses.filter((horse) => horse.status === statusFilter);

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

  useEffect(() => {
    fetchHorses();
    const refresh = () => fetchHorses();
    window.addEventListener("horseCreated", refresh);
    window.addEventListener("horseUpdated", refresh);
    return () => {
      window.removeEventListener("horseCreated", refresh);
      window.removeEventListener("horseUpdated", refresh);
    };
  }, []);

  const fetchHorseDetail = async (horseId) => {
    const response = await api.get(`/api/owner/horses/${horseId}`);
    if (response.data?.status !== "Success") {
      throw new Error(response.data?.message || "Không lấy được chi tiết ngựa");
    }
    return response.data.data || {};
  };

  const handleOpenDetail = async (horseId) => {
    setSelectedHorseId(horseId);
    setShowDetailModal(true);
    setLoadingDetail(true);
    setSelectedHorseDetail(null);
    try {
      const horseDetail = await fetchHorseDetail(horseId);
      setSelectedHorseDetail(horseDetail);
    } catch (err) {
      alertFail(err.response?.data?.message || err.message || "Lỗi khi lấy chi tiết ngựa");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenEdit = async (horseId) => {
    setSelectedHorseId(horseId);
    setShowEditModal(true);
    setLoadingDetail(true);
    setHorseForm(initialHorseForm);
    try {
      const horseDetail = await fetchHorseDetail(horseId);
      setHorseForm(mapHorseToForm(horseDetail));
    } catch (err) {
      alertFail(err.response?.data?.message || err.message || "Lỗi khi lấy chi tiết ngựa");
      setShowEditModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateHorse = async () => {
    if (!selectedHorseId) return;
    setUpdating(true);
    try {
      const response = await api.put(
        `/api/owner/horses/${selectedHorseId}`,
        buildHorsePayload(horseForm)
      );
      if (response.data?.status === "Success") {
        alertSuccess(response.data?.message || "Cập nhật ngựa thành công");
        setShowEditModal(false);
        window.dispatchEvent(new Event("horseUpdated"));
      } else {
        alertFail(response.data?.message || "Cập nhật ngựa thất bại");
      }
    } catch (err) {
      alertFail(err.response?.data?.message || err.message || "Lỗi khi cập nhật ngựa");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECTION: HORSE LIST TABLE */}
      <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
         {/* Table Header Controls */}
         <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Danh Sách Ngựa</h3>
                <span className="bg-[#D9A520]/10 text-[#D9A520] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-[#D9A520]/20">
                  {loading ? "Đang tải..." : `${horses.length} con ngựa`}
                </span>
            </div>
            
            <div className="flex flex-wrap gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-tighter">
               {['All', 'Active', 'Resting', 'Injured', 'Retired', 'Banned'].map((status) => (
                 <button
                   key={status}
                   onClick={() => setStatusFilter(status)}
                   className={`px-5 py-2.5 rounded-xl transition-all ${statusFilter === status ? 'bg-[#D9A520] text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                 >
                   {status === 'All' ? 'Tất cả' : status}
                 </button>
               ))}
            </div>
         </div>
         
         {/* Table Content */}
         <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Đang tải danh sách ngựa...</div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-red-400">{error}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 border-b border-white/5">
                    <th className="px-8 py-5">Tên ngựa</th>
                    <th className="px-8 py-5">Giống loài</th>
                    <th className="px-8 py-5 text-center">Màu sắc</th>
                    <th className="px-8 py-5 text-center">Giới tính</th>
                    <th className="px-8 py-5 text-center">Trạng thái</th>
                    <th className="px-8 py-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHorses.map((horse, idx) => (
                    <tr key={horse._id || idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D9A520] to-[#B8860B] flex items-center justify-center font-black text-black text-lg shadow-lg shadow-yellow-500/10 group-hover:scale-110 transition-transform">
                            {horse.name?.charAt(0) || "H"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white group-hover:text-[#D9A520] transition-colors">{horse.name}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Mã: {horse.registrationNumber || horse._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-medium text-gray-400 italic">{horse.breed}</td>
                      <td className="px-8 py-6 text-center text-xs font-bold text-gray-300">{horse.color || "-"}</td>
                      <td className="px-8 py-6 text-center text-xs font-bold text-gray-300">{horse.gender || "-"}</td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/10 text-[#D9A520] tracking-tighter">
                          {horse.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenDetail(horse._id)}
                            className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-[#D9A520] transition-all border border-white/5"
                          >
                            <Eye size={16}/>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(horse._id)}
                            className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-emerald-500 transition-all border border-white/5"
                          >
                            <Edit3 size={16}/>
                          </button>
                          <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5">
                            <MoreHorizontal size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
         </div>

         {/* Table Pagination */}
         <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/10">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Hiển thị 4 / 12 ngựa</p>
            <div className="flex gap-2">
               <button className="p-2 bg-white/5 rounded-lg text-gray-600 hover:text-white transition-colors border border-white/5 cursor-not-allowed">
                  <ChevronRight size={16} className="rotate-180" />
               </button>
               <button className="w-8 h-8 bg-[#D9A520] text-black rounded-lg text-xs font-black">1</button>
               <button className="w-8 h-8 bg-white/5 text-gray-500 rounded-lg text-xs font-bold hover:text-white hover:bg-white/10 transition-all">2</button>
               <button className="w-8 h-8 bg-white/5 text-gray-500 rounded-lg text-xs font-bold hover:text-white hover:bg-white/10 transition-all">3</button>
               <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors border border-white/5">
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[32px] bg-[#0B101A] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-black text-white">Chi tiết ngựa</h2>
                <p className="text-xs text-gray-400">Chỉ hiển thị thông tin cần thiết.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white">
                Đóng
              </button>
            </div>

            <div className="p-6">
              {loadingDetail ? (
                <div className="py-12 text-center text-sm text-gray-400">Đang tải chi tiết ngựa...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailFields.map((field) => (
                    <div key={field.key} className={field.key === "notes" ? "md:col-span-2" : ""}>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">{field.label}</p>
                      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white min-h-[52px] flex items-center">
                        {formatHorseDetailValue(field.key, selectedHorseDetail?.[field.key])}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[32px] bg-[#0B101A] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-black text-white">Cập nhật ngựa</h2>
                <p className="text-xs text-gray-400">Chỉ chỉnh sửa thông tin cơ bản cần thiết.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                Đóng
              </button>
            </div>

            <div className="p-6 space-y-4">
              {loadingDetail ? (
                <div className="py-12 text-center text-sm text-gray-400">Đang tải chi tiết ngựa...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={horseForm.name} onChange={(e) => setHorseForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Tên ngựa" className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <input value={horseForm.breed} onChange={(e) => setHorseForm((prev) => ({ ...prev, breed: e.target.value }))} placeholder="Giống loài" className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <input value={horseForm.color} onChange={(e) => setHorseForm((prev) => ({ ...prev, color: e.target.value }))} placeholder="Màu sắc" className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <select value={horseForm.gender} onChange={(e) => setHorseForm((prev) => ({ ...prev, gender: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50">
                      <option value="">Chọn giới tính</option>
                      <option value="Stallion">Stallion</option>
                      <option value="Mare">Mare</option>
                    </select>
                    <input type="date" value={horseForm.dateOfBirth} onChange={(e) => setHorseForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <input value={horseForm.registrationNumber} onChange={(e) => setHorseForm((prev) => ({ ...prev, registrationNumber: e.target.value }))} placeholder="Mã đăng ký" className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <input type="number" value={horseForm.weightKg} onChange={(e) => setHorseForm((prev) => ({ ...prev, weightKg: e.target.value }))} placeholder="Cân nặng (kg)" className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <input type="number" value={horseForm.heightCm} onChange={(e) => setHorseForm((prev) => ({ ...prev, heightCm: e.target.value }))} placeholder="Chiều cao (cm)" className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                    <select value={horseForm.status} onChange={(e) => setHorseForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50 md:col-span-2">
                      {["Active", "Resting", "Injured", "Retired", "Banned"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <textarea value={horseForm.notes} onChange={(e) => setHorseForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Ghi chú" rows={4} className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#D9A520]/50" />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-black/10">
              <button onClick={() => setShowEditModal(false)} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5 transition-all">
                Hủy
              </button>
              <button onClick={handleUpdateHorse} disabled={loadingDetail || updating} className="rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ĐẢM BẢO CÓ DÒNG NÀY ĐỂ HẾT LỖI IMPORT
export default OwnerDashboard;
