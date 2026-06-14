import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Spin, message, Tag, Space } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";

const WITHDRAWALS_API = "/api/admin/withdrawals";
const APPROVE_API = "/api/admin/withdrawals/approve";
const REJECT_API = "/api/admin/withdrawals/reject";

const formatCurrency = (value) => `₫${Number(value ?? 0).toLocaleString("vi-VN")}`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const getStatusBadge = (status) => {
  const badges = {
    Pending: { color: "warning", text: "Chờ duyệt" },
    Approved: { color: "success", text: "Đã duyệt" },
    Rejected: { color: "error", text: "Từ chối" },
    Completed: { color: "processing", text: "Hoàn thành" },
  };
  return badges[status] || { color: "default", text: status };
};

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(WITHDRAWALS_API);
      if (response.data?.data) {
        setWithdrawals(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch withdrawals");
      message.error("Lỗi khi tải danh sách rút tiền");
      console.error("Fetch withdrawals error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve withdrawal
  const handleApprove = async (withdrawalId) => {
    Modal.confirm({
      title: "Xác nhận duyệt rút tiền",
      content: "Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [withdrawalId]: true }));
          await api.post(`${APPROVE_API}/${withdrawalId}`);
          message.success("Duyệt rút tiền thành công");
          fetchWithdrawals();
        } catch (err) {
          message.error(err.response?.data?.message || "Lỗi khi duyệt rút tiền");
        } finally {
          setActionLoading((prev) => ({ ...prev, [withdrawalId]: false }));
        }
      },
    });
  };

  // Reject withdrawal
  const handleRejectClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setActionLoading((prev) => ({
        ...prev,
        [selectedWithdrawal._id]: true,
      }));
      await api.post(`${REJECT_API}/${selectedWithdrawal._id}`, {
        reason: rejectReason,
      });
      message.success("Từ chối rút tiền thành công");
      setRejectModalVisible(false);
      fetchWithdrawals();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi từ chối rút tiền");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [selectedWithdrawal._id]: false,
      }));
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

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
      render: (_, record) => (
        <div className="font-semibold text-green-400">
          {formatCurrency(record.amount)}
        </div>
      ),
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
        const isLoading = actionLoading[record._id];
        const isPending = record.status === "Pending";

        if (!isPending) {
          return <span className="text-gray-500">-</span>;
        }

        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record._id)}
              loading={isLoading}
              disabled={isLoading}
            >
              Duyệt
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleRejectClick(record)}
              loading={isLoading}
              disabled={isLoading}
            >
              Từ chối
            </Button>
          </Space>
        );
      },
      align: "center",
      width: 200,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Quản lý rút tiền</h1>
          <p className="text-gray-400 mt-2">
            Danh sách các yêu cầu rút tiền chờ duyệt
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-300">
            {error}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <Spin spinning={loading} tip="Đang tải...">
            <Table
              columns={columns}
              dataSource={withdrawals}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} yêu cầu`,
              }}
              scroll={{ x: 1200 }}
              className="bg-slate-800"
              style={{
                color: "white",
              }}
            />
          </Spin>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu rút tiền"
        visible={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        loading={actionLoading[selectedWithdrawal?._id]}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Thông tin yêu cầu:</p>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p>
                <strong>Người yêu cầu:</strong>{" "}
                {selectedWithdrawal?.user?.fullName}
              </p>
              <p>
                <strong>Số tiền:</strong>{" "}
                {formatCurrency(selectedWithdrawal?.amount)}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Lý do từ chối:
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
