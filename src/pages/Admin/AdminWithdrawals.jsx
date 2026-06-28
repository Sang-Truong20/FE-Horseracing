import React, { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Space, Spin, Table, Tag, message } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../config/axios";

const ADMIN_WITHDRAWALS_API = "/api/admin/withdrawals";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "0 ₫";
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
};

const getStatusBadge = (status) => {
  const badges = {
    Pending: { color: "warning", text: "Chờ duyệt" },
    Approved: { color: "success", text: "Đã duyệt" },
    Rejected: { color: "error", text: "Từ chối" },
    Completed: { color: "processing", text: "Hoàn thành" },
    pending: { color: "warning", text: "Chờ duyệt" },
    approved: { color: "success", text: "Đã duyệt" },
    rejected: { color: "error", text: "Từ chối" },
  };

  return badges[status] || { color: "default", text: status || "-" };
};

const AdminWithdrawals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(ADMIN_WITHDRAWALS_API);
      const payload = response.data?.data ?? response.data ?? [];
      const resolvedWithdrawals = Array.isArray(payload)
        ? payload
        : payload.items ?? payload.withdrawals ?? [];
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
  const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));

  const closeActionModal = () => {
    setIsActionModalVisible(false);
    setActionType(null);
    setActionNote("");
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      setActionLoading(true);
      const response = await api.patch(`${ADMIN_WITHDRAWALS_API}/${selectedWithdrawal._id}`, {
        action: "approve",
        note: actionNote,
      });

      if (response.status === 200 || response.data?.status === "Success") {
        message.success("Duyệt yêu cầu rút tiền thành công");
        closeActionModal();
        fetchWithdrawals();
      } else {
        message.error(response.data?.message || "Duyệt yêu cầu thất bại");
      }
    } catch (err) {
      console.error("Approve withdrawal error:", err);
      message.error(err.response?.data?.message || err.message || "Duyệt yêu cầu thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      setActionLoading(true);
      const response = await api.patch(`${ADMIN_WITHDRAWALS_API}/${selectedWithdrawal._id}`, {
        action: "reject",
        note: actionNote,
      });

      if (response.status === 200 || response.data?.status === "Success") {
        message.success("Từ chối yêu cầu rút tiền thành công");
        closeActionModal();
        fetchWithdrawals();
      } else {
        message.error(response.data?.message || "Từ chối yêu cầu thất bại");
      }
    } catch (err) {
      console.error("Reject withdrawal error:", err);
      message.error(err.response?.data?.message || err.message || "Từ chối yêu cầu thất bại");
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

  const columns = [
    {
      title: "Người yêu cầu",
      key: "user",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-semibold">{record.user?.fullName}</div>
          <div className="text-xs text-gray-400">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Số tiền",
      key: "amount",
      render: (_, record) => <div className="font-semibold text-green-400">{formatCurrency(record.amount)}</div>,
      align: "right",
    },
    {
      title: "Thông tin ngân hàng",
      key: "bankInfo",
      render: (_, record) => (
        <div className="text-xs">
          <div className="font-semibold">{record.payoutInfo?.bankName}</div>
          <div className="text-gray-400">{record.payoutInfo?.accountNumber}</div>
          <div className="text-gray-400">{record.payoutInfo?.accountName}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const statusInfo = getStatusBadge(record.status);
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      align: "center",
    },
    {
      title: "Ngày yêu cầu",
      key: "createdAt",
      render: (_, record) => formatDateTime(record.createdAt),
      width: 200,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const isPending = record.status === "Pending" || record.status === "pending";

        if (!isPending) return <span className="text-gray-500">-</span>;

        return (
          <Space size="small">
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => openActionModal(record, "approve")}>
              Duyệt
            </Button>
            <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => openActionModal(record, "reject")}>
              Từ chối
            </Button>
          </Space>
        );
      },
      align: "center",
      width: 200,
    },
  ];

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
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold">Quản lí Rút Tiền</h1>
          <p className="mt-2 text-gray-400">Xem và quản lý các yêu cầu rút tiền của người dùng</p>
        </div>

        {error && <Alert message={error} type="error" showIcon closable />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Tìm kiếm</label>
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
            <p className="text-sm text-gray-400">Tổng yêu cầu</p>
            <p className="mt-1 text-2xl font-bold text-white">{withdrawals.length}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Đang hiển thị</p>
            <p className="mt-1 text-2xl font-bold text-white">{filteredWithdrawals.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
          {paginatedWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Không có yêu cầu rút tiền nào</div>
          ) : (
            <Table columns={columns} dataSource={paginatedWithdrawals} rowKey={(record) => record._id || record.id} pagination={false} scroll={{ x: 1200 }} />
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-6 py-4">
            <span className="text-sm text-gray-400">Trang {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded p-2 hover:bg-gray-700 disabled:opacity-50 transition">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="rounded p-2 hover:bg-gray-700 disabled:opacity-50 transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        <Modal title="Chi tiết yêu cầu rút tiền" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={null}>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">ID Giao Dịch</label>
                <p className="mt-1 text-white">{selectedWithdrawal._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Người dùng</label>
                <p className="mt-1 text-white">{selectedWithdrawal.user?.fullName}</p>
                <p className="text-xs text-gray-400">{selectedWithdrawal.user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Số tiền</label>
                <p className="mt-1 text-white">{formatCurrency(selectedWithdrawal.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Trạng thái</label>
                <p className="mt-1 text-white">{getStatusBadge(selectedWithdrawal.status).text}</p>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          title={actionType === "approve" ? "Duyệt yêu cầu rút tiền" : "Từ chối yêu cầu rút tiền"}
          open={isActionModalVisible}
          onOk={actionType === "approve" ? handleApprove : handleReject}
          onCancel={closeActionModal}
          okText={actionType === "approve" ? "Duyệt" : "Từ chối"}
          cancelText="Hủy"
          confirmLoading={actionLoading}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{actionType === "approve" ? "Bạn có chắc muốn duyệt yêu cầu này?" : "Bạn có chắc muốn từ chối yêu cầu này?"}</p>
            {selectedWithdrawal && <p className="text-sm text-gray-800"><strong>Số tiền:</strong> {formatCurrency(selectedWithdrawal.amount)}</p>}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Ghi chú</label>
              <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Nhập ghi chú (tùy chọn)" className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none" rows="3" />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
