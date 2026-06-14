import React, { useEffect, useState } from "react";
import { Button, Form, Input, Upload, message, Spin, Modal } from "antd";
import { FileOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const LICENSE_API = "/api/jockey/license";
const REQUEST_LICENSE_API = "/api/jockey/license/request";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const getStatusInfo = (status) => {
  const statusMap = {
    NotRequested: {
      label: "Chưa yêu cầu",
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      icon: "⭕",
    },
    Pending: {
      label: "Chờ duyệt",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      icon: <ClockCircleOutlined className="text-lg" />,
    },
    Approved: {
      label: "Đã duyệt",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      icon: <CheckCircleOutlined className="text-lg" />,
    },
    Rejected: {
      label: "Bị từ chối",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      icon: <CloseCircleOutlined className="text-lg" />,
    },
  };
  return statusMap[status] || statusMap.NotRequested;
};

const JockeyLicense = () => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch license status
  const fetchLicense = async () => {
    try {
      setLoading(true);
      const response = await api.get(LICENSE_API);
      if (response.data?.data) {
        setLicense(response.data.data);
      }
    } catch (err) {
      console.error("Fetch license error:", err);
      message.error("Lỗi khi tải thông tin cấp phép");
    } finally {
      setLoading(false);
    }
  };

  // Request license
  const handleRequestLicense = async (values) => {
    if (fileList.length === 0) {
      message.warning("Vui lòng tải lên ít nhất 1 tài liệu");
      return;
    }

    Modal.confirm({
      title: "Xác nhận yêu cầu cấp phép",
      content: "Bạn có chắc chắn muốn gửi yêu cầu cấp phép Jockey này?",
      okText: "Gửi yêu cầu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setSubmitting(true);
          const payload = {
            note: values.note,
            documents: fileList.map((file) => file.url || file.name),
          };
          await api.post(REQUEST_LICENSE_API, payload);
          message.success("Gửi yêu cầu cấp phép thành công");
          form.resetFields();
          setFileList([]);
          setIsModalVisible(false);
          fetchLicense();
        } catch (err) {
          message.error(err.response?.data?.message || "Lỗi khi gửi yêu cầu");
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const statusInfo = license ? getStatusInfo(license.state) : getStatusInfo("NotRequested");
  const canRequest = license?.state === "NotRequested" || license?.state === "Rejected";

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cấp phép Jockey</h1>
        <p className="text-gray-400">Quản lý và theo dõi trạng thái cấp phép của bạn</p>
      </div>

      <Spin spinning={loading} tip="Đang tải...">
        {/* Status Card */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Trạng thái cấp phép</h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusInfo.bgColor}`}>
              {statusInfo.icon}
              <span className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License Number */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Mã cấp phép</p>
              <p className="text-white font-semibold text-lg">
                {license?.licenseNumber || "-"}
              </p>
            </div>

            {/* Requested Date */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Ngày yêu cầu</p>
              <p className="text-white font-semibold text-lg">
                {formatDateTime(license?.licenseRequestedAt)}
              </p>
            </div>

            {/* Request Note */}
            {license?.licenseRequestNote && (
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Ghi chú yêu cầu</p>
                <p className="text-white">{license.licenseRequestNote}</p>
              </div>
            )}

            {/* Reject Reason */}
            {license?.licenseRejectReason && (
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Lý do từ chối</p>
                <p className="text-red-400">{license.licenseRejectReason}</p>
              </div>
            )}

            {/* Documents */}
            {license?.licenseDocuments && license.licenseDocuments.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Tài liệu đã gửi</p>
                <div className="space-y-2">
                  {license.licenseDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-700 rounded hover:bg-slate-600 transition"
                    >
                      <FileOutlined className="text-blue-400" />
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm truncate"
                      >
                        {doc}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request License Form */}
        {canRequest && (
          <div>
            <Button
              type="primary"
              size="large"
              className="mb-6 bg-purple-600 hover:bg-purple-700 border-0"
              onClick={() => setIsModalVisible(true)}
            >
              Gửi yêu cầu cấp phép
            </Button>
          </div>
        )}

        {/* Request License Modal */}
        <Modal
          title="Gửi yêu cầu cấp phép Jockey"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitting}
              onClick={() => form.submit()}
              className="bg-purple-600 border-0"
            >
              Gửi yêu cầu
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRequestLicense}
            className="mt-4"
          >
            <Form.Item
              label="Ghi chú"
              name="note"
              rules={[
                { required: true, message: "Vui lòng nhập ghi chú" },
                { min: 10, message: "Ghi chú phải ít nhất 10 ký tự" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Mô tả lý do yêu cầu cấp phép, kinh nghiệm, v.v..."
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
              />
            </Form.Item>

            <Form.Item
              label="Tài liệu"
              required
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false}
                maxCount={5}
              >
                <Button
                  className="border-slate-600 text-gray-300 hover:text-white hover:border-slate-500"
                >
                  Tải lên tài liệu (tối đa 5 file)
                </Button>
              </Upload>
              <p className="text-xs text-gray-400 mt-2">
                Tải lên các tài liệu liên quan như: CV, bằng cấp, giấy chứng nhận, v.v...
              </p>
            </Form.Item>
          </Form>
        </Modal>

        {/* Info Message */}
        {license?.state === "Pending" && (
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-600 rounded-lg text-yellow-300 text-sm">
            ⏳ Yêu cầu cấp phép của bạn đang chờ xem xét từ Admin. Vui lòng chờ trong khoảng 3-5 ngày làm việc.
          </div>
        )}

        {license?.state === "Approved" && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-600 rounded-lg text-green-300 text-sm">
            ✅ Chúc mừng! Bạn đã được cấp phép Jockey. Mã cấp phép của bạn là: <strong>{license.licenseNumber}</strong>
          </div>
        )}

        {license?.state === "Rejected" && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-600 rounded-lg text-red-300 text-sm">
            ❌ Yêu cầu cấp phép của bạn đã bị từ chối. Vui lòng xem lý do từ chối ở trên và gửi lại yêu cầu.
          </div>
        )}
      </Spin>
    </div>
  );
};

export default JockeyLicense;
