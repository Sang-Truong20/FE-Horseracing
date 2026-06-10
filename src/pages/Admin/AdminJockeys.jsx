import React, { useState, useEffect } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";
import { Check, X, Loader } from "lucide-react";

const AdminJockeys = () => {
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // "approve" or "reject"
  const [selectedJockey, setSelectedJockey] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: "",
    reason: "",
  });

  useEffect(() => {
    fetchPendingJockeys();
  }, []);

  const fetchPendingJockeys = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/admin/jockeys/pending-licenses");
      
      if (response.data.status === "Success") {
        setJockeys(response.data.data || []);
      } else {
        setError(response.data.message || "Không thể tải danh sách jockey");
      }
    } catch (err) {
      console.error("Lỗi tải jockey:", err);
      setError(err.response?.data?.message || "Lỗi khi tải danh sách jockey");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (jockey, action) => {
    setSelectedJockey(jockey);
    setModalAction(action);
    setFormData({
      licenseNumber: "",
      reason: "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedJockey(null);
    setModalAction(null);
    setFormData({ licenseNumber: "", reason: "" });
  };

  const handleConfirm = async () => {
    if (!selectedJockey) return;

    // Validation
    if (modalAction === "approve" && !formData.licenseNumber) {
      alert("Vui lòng nhập số giấy phép!");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Vui lòng nhập lý do!");
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.patch(
        `/api/admin/jockeys/${selectedJockey._id}/license`,
        {
          action: modalAction,
          licenseNumber: formData.licenseNumber || undefined,
          reason: formData.reason,
        }
      );

      if (response.data.status === "Success") {
        alert(
          modalAction === "approve"
            ? "Duyệt cấp phép thành công!"
            : "Từ chối cấp phép thành công!"
        );
        closeModal();
        fetchPendingJockeys();
      } else {
        alert(response.data.message || "Có lỗi xảy ra!");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert(err.response?.data?.message || "Lỗi khi xử lý yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (jockey) => {
    openModal(jockey, "approve");
  };

  const handleReject = (jockey) => {
    openModal(jockey, "reject");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Cấp Phép Jockey</h1>
          <p className="text-gray-400 mt-2">Duyệt và quản lý giấy phép jockey ({jockeys.length})</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <Loader className="animate-spin mx-auto mb-2" />
            <p className="text-gray-400">Đang tải danh sách...</p>
          </div>
        ) : jockeys.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <p className="text-gray-400">Không có jockey nào chờ cấp phép</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tài khoản</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Họ và tên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kinh nghiệm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Giá/đua</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Chờ (ngày)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {jockeys.map((jockey) => (
                    <tr key={jockey._id} className="hover:bg-gray-750 transition">
                      <td className="px-6 py-4 text-sm text-gray-100">{jockey.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-100">{jockey.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-100">{jockey.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-100">{jockey.experienceYears} năm</td>
                      <td className="px-6 py-4 text-sm text-gray-100">${jockey.pricePerRace}</td>
                      <td className="px-6 py-4 text-sm text-yellow-400 font-medium">{jockey.daysWaiting} ngày</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(jockey)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs transition"
                          >
                            <Check size={14} /> Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(jockey)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition"
                          >
                            <X size={14} /> Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalAction === "approve" ? "Duyệt Cấp Phép" : "Từ Chối Cấp Phép"}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-700/50 rounded">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Jockey:</span> {selectedJockey?.fullName} ({selectedJockey?.username})
              </p>
              <p className="text-sm text-gray-300 mt-1">
                <span className="font-semibold">Email:</span> {selectedJockey?.email}
              </p>
            </div>

            {modalAction === "approve" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số Giấy Phép <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  placeholder="Nhập số giấy phép..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lý Do <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Nhập lý do..."
                rows="3"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-100 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 rounded text-white transition disabled:opacity-50 ${
                  modalAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading ? "Đang xử lý..." : modalAction === "approve" ? "Duyệt" : "Từ Chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminJockeys;
