import React, { useState, useEffect } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { SearchOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Spin, Alert, message, Select } from "antd";
import { Eye, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../config/axios";

const ADMIN_WITHDRAWALS_API = "/api/admin/withdrawals";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const formatCurrency = (value) => {
  if (!value) return "0 ₫";
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
};

const getStatusBadge = (status) => {
  const badges = {
    Pending: "bg-yellow-500/20 text-yellow-300",
    pending: "bg-yellow-500/20 text-yellow-300",
    Approved: "bg-green-500/20 text-green-300",
    approved: "bg-green-500/20 text-green-300",
    Rejected: "bg-red-500/20 text-red-300",
    rejected: "bg-red-500/20 text-red-300",
  };
  return badges[status] || "bg-gray-500/20 text-gray-300";
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ duyệt",
    Pending: "Chờ duyệt",
    approved: "Đã duyệt",
    Approved: "Đã duyệt",
    rejected: "Bị từ chối",
    Rejected: "Bị từ chối",
  };
  return labels[status] || status;
};

const AdminWithdrawals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // "approve" or "reject"
  const [actionNote, setActionNote] = useState("");
  const [form] = Form.useForm();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(ADMIN_WITHDRAWALS_API);
      const payload = response.data?.data ?? [];
      const resolvedWithdrawals = Array.isArray(payload) ? payload : [];
      setWithdrawals(resolvedWithdrawals);
    } catch (fetchError) {
      console.error("Fetch withdrawals error:", fetchError);
      setError("Không thể tải danh sách yêu cầu rút tiền. Vui lòng thử lại.");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản lí Rút Tiền - Thunder";
    fetchWithdrawals();
  }, []);

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const searchString = `${withdrawal.user?.fullName ?? ""} ${withdrawal.user?.email ?? ""} ${withdrawal._id ?? ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWithdrawals = filteredWithdrawals.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;
    try {
      setActionLoading(true);
      const response = await api.patch(
        `${ADMIN_WITHDRAWALS_API}/${selectedWithdrawal._id}`,
        {
          action: "approve",
          note: actionNote,
        }
      );
      if (response.status === 200 || response.data?.status === "Success") {
        message.success("Duyệt yêu cầu rút tiền thành công");
        setIsActionModalVisible(false);
        setActionNote("");
        setActionType(null);
        fetchWithdrawals();
      } else {
        message.error(response.data?.message || "Duyệt yêu cầu thất bại");
      }
    } catch (err) {
      console.error("Approve withdrawal error:", err);
      message.error(
        err.response?.data?.message || err.message || "Duyệt yêu cầu thất bại"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    try {
      setActionLoading(true);
      const response = await api.patch(
        `${ADMIN_WITHDRAWALS_API}/${selectedWithdrawal._id}`,
        {
          action: "reject",
          note: actionNote,
        }
      );
      if (response.status === 200 || response.data?.status === "Success") {
        message.success("Từ chối yêu cầu rút tiền thành công");
        setIsActionModalVisible(false);
        setActionNote("");
        setActionType(null);
        fetchWithdrawals();
      } else {
        message.error(response.data?.message || "Từ chối yêu cầu thất bại");
      }
    } catch (err) {
      console.error("Reject withdrawal error:", err);
      message.error(
        err.response?.data?.message || err.message || "Từ chối yêu cầu thất bại"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (withdrawal, type) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(type);
    setActionNote("");
    setIsActionModalVisible(true);
  };

  const openDetailModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailModalVisible(true);
  };

  if (loading && withdrawals.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản lí Rút Tiền</h1>
          <p className="mt-2 text-gray-400">
            Xem và quản lý các yêu cầu rút tiền của người dùng
          </p>
        </div>

        {error && <Alert message={error} type="error" showIcon closable />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Tìm kiếm
            </label>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tên chủ ngựa, email, ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Tổng yêu cầu chờ duyệt</p>
            <p className="mt-1 text-2xl font-bold text-white">{withdrawals.length}</p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Đang hiển thị</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {filteredWithdrawals.length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
          {paginatedWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Không có yêu cầu rút tiền nào
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    ID Giao Dịch
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Ngân hàng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedWithdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal._id}
                    className="border-b border-gray-700 hover:bg-gray-750 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {withdrawal._id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div>
                        <p className="font-medium">
                          {withdrawal.user?.fullName || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {withdrawal.user?.email || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {withdrawal.payoutInfo?.bankName || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDateTime(withdrawal.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailModal(withdrawal)}
                          className="rounded p-2 hover:bg-gray-700 transition text-gray-400 hover:text-gray-200"
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {withdrawal.status === "pending" ||
                        withdrawal.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => openActionModal(withdrawal, "approve")}
                              className="rounded p-2 hover:bg-green-700/30 transition text-green-400"
                              title="Duyệt"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => openActionModal(withdrawal, "reject")}
                              className="rounded p-2 hover:bg-red-700/30 transition text-red-400"
                              title="Từ chối"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-6 py-4">
            <span className="text-sm text-gray-400">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded p-2 hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded p-2 hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          title="Chi tiết yêu cầu rút tiền"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          className="dark-modal"
        >
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">ID Giao Dịch</label>
                <p className="mt-1 text-white">{selectedWithdrawal._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Người dùng
                </label>
                <p className="mt-1 text-white">
                  {selectedWithdrawal.user?.fullName}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedWithdrawal.user?.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Số tiền
                </label>
                <p className="mt-1 text-white">
                  {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Số dư sau giao dịch
                </label>
                <p className="mt-1 text-white">
                  {formatCurrency(selectedWithdrawal.balanceAfter)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Trạng thái
                </label>
                <p className="mt-1 text-white">
                  {getStatusLabel(selectedWithdrawal.status)}
                </p>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Thông tin ngân hàng</h4>
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Ngân hàng
                  </label>
                  <p className="mt-1 text-white">
                    {selectedWithdrawal.payoutInfo?.bankName || "-"}
                  </p>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-400">
                    Số tài khoản
                  </label>
                  <p className="mt-1 text-white">
                    {selectedWithdrawal.payoutInfo?.accountNumber || "-"}
                  </p>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-400">
                    Tên chủ tài khoản
                  </label>
                  <p className="mt-1 text-white">
                    {selectedWithdrawal.payoutInfo?.accountName || "-"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Ngày tạo
                </label>
                <p className="mt-1 text-white">
                  {formatDateTime(selectedWithdrawal.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Mô tả
                </label>
                <p className="mt-1 text-white">
                  {selectedWithdrawal.description || "-"}
                </p>
              </div>
            </div>
          )}
        </Modal>

        {/* Action Modal */}
        <Modal
          title={
            actionType === "approve"
              ? "Duyệt yêu cầu rút tiền"
              : "Từ chối yêu cầu rút tiền"
          }
          open={isActionModalVisible}
          onOk={() => (actionType === "approve" ? handleApprove() : handleReject())}
          onCancel={() => {
            setIsActionModalVisible(false);
            setActionNote("");
            setActionType(null);
          }}
          okText={actionType === "approve" ? "Duyệt" : "Từ chối"}
          cancelText="Hủy"
          confirmLoading={actionLoading}
          className="dark-modal"
          okButtonProps={{
            className:
              actionType === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700",
          }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">
                {actionType === "approve"
                  ? "Bạn có chắc muốn duyệt yêu cầu này?"
                  : "Bạn có chắc muốn từ chối yêu cầu này? (Tiền sẽ được hoàn lại)"}
              </p>
              {selectedWithdrawal && (
                <p className="mt-2 text-white">
                  <strong>Số tiền:</strong> {formatCurrency(selectedWithdrawal.amount)}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Ghi chú
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Nhập ghi chú (tùy chọn)"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                rows="3"
              />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
