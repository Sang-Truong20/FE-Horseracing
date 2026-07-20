import React, { useEffect, useState } from "react";
import { Alert, Modal, Spin, Form, Input, Select, DatePicker, Checkbox, message } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";

const ADMIN_RACES_API = "/api/admin/races";

const formatCurrency = (value) => `₫${Number(value ?? 0).toLocaleString("vi-VN")}`;

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
};

const getStatusBadge = (status) => {
  const badges = {
    Open: "bg-emerald-500/20 text-emerald-300",
    Draft: "bg-gray-500/20 text-gray-300",
    Pending: "bg-yellow-500/20 text-yellow-300",
    Locked: "bg-red-500/20 text-red-300",
    Finished: "bg-purple-500/20 text-purple-300",
  };

  return badges[status] || "bg-gray-500/20 text-gray-300";
};

const AdminRaces = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [referees, setReferees] = useState([]);
  const [owners, setOwners] = useState([]);
  const [horseLabels, setHorseLabels] = useState({});
  const [userLabels, setUserLabels] = useState({});
  const [oddsModalVisible, setOddsModalVisible] = useState(false);
  const [oddsInputs, setOddsInputs] = useState({});
  const [oddsSubmitting, setOddsSubmitting] = useState(false);
  const [createForm] = Form.useForm();

  const getEntityLabel = (entity) => {
    if (!entity) return "-";
    if (typeof entity === "string") {
      if (/^[0-9a-fA-F]{24}$/.test(entity)) {
        return horseLabels[entity] || userLabels[entity] || "-";
      }
      return entity;
    }
    return (
      entity.name ||
      entity.fullName ||
      entity.hoTen ||
      entity.username ||
      entity.stableName ||
      entity.email ||
      "-"
    );
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/admin/users");
      const payload = response.data?.data ?? response.data ?? [];
      const users = Array.isArray(payload) ? payload : payload.users ?? payload.items ?? [];
      const map = {};
      users.forEach((user) => {
        const id = user._id || user.id;
        if (!id) return;
        map[id] = user.fullName || user.username || user.email || user.name || "-";
      });
      setUserLabels(map);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const fetchHorses = async () => {
    try {
      const response = await api.get("/api/admin/horses");
      const payload = response.data?.status === "Success" ? response.data.data : [];
      const horses = Array.isArray(payload) ? payload : [];
      const map = {};
      horses.forEach((horse) => {
        const id = horse._id || horse.id;
        if (!id) return;
        map[id] = horse.name || horse.title || horse.horseName || "-";
      });
      setHorseLabels(map);
    } catch (err) {
      console.error("Fetch horses error:", err);
    }
  };

  const fetchReferees = async () => {
    try {
      const response = await api.get("/api/admin/referees");
      const payload = response.data?.status === "Success" ? response.data.data : [];
      setReferees(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Fetch referees error:", err);
      setReferees([]);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await api.get("/api/admin/owners");
      const payload = response.data?.status === "Success" ? response.data.data : [];
      const ownerList = Array.isArray(payload) ? payload : [];
      if (ownerList.length) {
        setOwners(
          ownerList.map((owner) => ({
            ...owner,
            value: owner._id || owner.id,
            label: owner.fullName || owner.stableName || owner.username || owner.email || "-",
          }))
        );
        return;
      }
    } catch (err) {
      console.error("Fetch owners error:", err);
    }

    try {
      const response = await api.get("/api/admin/users");
      const payload = response.data?.data ?? response.data ?? [];
      const users = Array.isArray(payload) ? payload : payload.users ?? payload.items ?? [];
      const ownerList = users.filter((user) => {
        const role = user.role || user.userRole || user.roleName || user.accountType;
        return ["OwnerHorse", "Owner", "ownerhorse", "owner"].includes(role);
      });
      setOwners(
        ownerList.map((owner) => ({
          ...owner,
          value: owner._id || owner.id,
          label: owner.fullName || owner.stableName || owner.username || owner.email || "-",
        }))
      );
    } catch (fallbackError) {
      console.error("Fetch owners fallback error:", fallbackError);
      setOwners([]);
    }
  };

  const openOddsModal = (race) => {
    if (!race?.registrations?.length) {
      message.warning("Race chưa có đăng ký để thêm tỷ lệ cược.");
      return;
    }
    const initialOdds = {};
    race.registrations.forEach((registration) => {
      const id = registration._id || registration.registrationId;
      if (!id) return;
      initialOdds[id] = {
        oddTop1: registration.oddTop1 ?? "",
        oddTop2: registration.oddTop2 ?? "",
        oddTop3: registration.oddTop3 ?? "",
      };
    });
    setOddsInputs(initialOdds);
    setSelectedRace(race);
    setOddsModalVisible(true);
  };

  const closeOddsModal = () => {
    if (oddsSubmitting) return;
    setOddsModalVisible(false);
  };

  const handleOddsChange = (registrationId, field, value) => {
    setOddsInputs((current) => ({
      ...current,
      [registrationId]: {
        ...(current[registrationId] || {}),
        [field]: value,
      },
    }));
  };

  const submitOdds = async () => {
    if (!selectedRace) return;
    const odds = Object.entries(oddsInputs).map(([registrationId, values]) => ({
      registrationId,
      oddTop1: Number(values.oddTop1) || 0,
      oddTop2: Number(values.oddTop2) || 0,
      oddTop3: Number(values.oddTop3) || 0,
    }));

    setOddsSubmitting(true);
    try {
      const response = await api.patch(`/api/admin/races/${selectedRace._id}/odds`, { odds });
      if (response.data?.status === "Success") {
        message.success(response.data?.message || "Đã cập nhật tỷ lệ cược thành công.");
        setOddsModalVisible(false);
        setSelectedRace((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            registrations: prev.registrations.map((registration) => {
              const id = registration._id || registration.registrationId;
              const updated = odds.find((item) => item.registrationId === id);
              return updated ? { ...registration, ...updated } : registration;
            }),
          };
        });
        fetchRaces();
      } else {
        message.error(response.data?.message || "Không thể cập nhật tỷ lệ cược.");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi gửi tỷ lệ cược.");
    } finally {
      setOddsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
    createForm.resetFields();
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleCreateRace = async () => {
    try {
      const values = await createForm.validateFields();
      let prizeDistribution;
      try {
        prizeDistribution = JSON.parse(values.prizeDistribution);
        if (!Array.isArray(prizeDistribution)) throw new Error();
      } catch (parseError) {
        message.error("Prize distribution phải là JSON array hợp lệ.");
        return;
      }

      const payload = {
        name: values.name,
        raceDate: values.raceDate.toISOString(),
        location: values.location,
        distanceM: Number(values.distanceM),
        refereeId: values.refereeId,
        status: values.status,
        prizeMoney: Number(values.prizeMoney),
        entryFee: Number(values.entryFee),
        addEntryFeeToPrize: Boolean(values.addEntryFeeToPrize),
        registrationCloseAt: values.registrationCloseAt.toISOString(),
        invitedOwners: (values.invitedOwners || []).map((ownerId) => String(ownerId)),
        prizeDistribution,
      };

      setCreating(true);
      const response = await api.post(ADMIN_RACES_API, payload);
      if (response.data?.status === "Success") {
        const createdRace = response.data?.data ?? response.data;
        setRaces((prev) => [createdRace, ...prev]);
        setCreateModalVisible(false);
        message.success(response.data?.message || "Tạo cuộc đua thành công.");
        createForm.resetFields();
      } else {
        message.error(response.data?.message || "Tạo cuộc đua thất bại.");
      }
    } catch (err) {
      console.error("Create race error:", err);
      message.error(err.response?.data?.message || "Lỗi khi tạo cuộc đua. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  const fetchRaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(ADMIN_RACES_API);
      const payload = response.data?.status === "Success" ? response.data.data : [];
      const resolvedRaces = Array.isArray(payload) ? payload : [];
      setRaces(resolvedRaces);
    } catch (fetchError) {
      console.error("Fetch races error:", fetchError);
      setError("Không thể tải danh sách cuộc đua. Vui lòng thử lại.");
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản Lý Cuộc Đua - Thunder";
    fetchRaces();
    fetchUsers();
    fetchHorses();
    fetchReferees();
    fetchOwners();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản Lý Cuộc Đua</h1>
          <p className="mt-2 text-gray-400">Danh sách toàn bộ race trong hệ thống</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="border-gray-700 bg-gray-800 text-white"
          />
        )}

        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
          <div className="flex flex-col gap-4 border-b border-gray-700 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Danh Sách Cuộc Đua</h2>
              <p className="text-sm text-gray-400">{races.length} cuộc đua</p>
            </div>
            <button
              onClick={openCreateModal}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Tạo cuộc đua mới
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              <Spin /> Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700 bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">CUỘC ĐUA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGÀY ĐUA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ĐỊA ĐIỂM</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">CỰ LY</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">REFEREE</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ĐĂNG KÝ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">PHÍ THAM GIA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">CỘNG PHÍ VÀO THƯỞNG</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">GIẢI THƯỞNG</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGÀY TẠO</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {races.length > 0 ? (
                    races.map((race) => (
                      <tr key={race._id} className="border-b border-gray-700 transition hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{race.name || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(race.raceDate)}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.location || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.distanceM ?? 0} m</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(race.status)}`}>
                            {race.status || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p>{race.referee?.fullName || "-"}</p>
                            <p className="text-xs text-gray-500">{race.referee?.email || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.registrations?.length ?? 0}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{formatCurrency(race.entryFee)}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{race.addEntryFeeToPrize ? "Có" : "Không"}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{formatCurrency(race.prizeMoney)}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(race.createdAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedRace(race)}
                            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="px-6 py-8 text-center text-gray-400">
                        Không có cuộc đua để hiển thị
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          title={`Chi tiết cuộc đua: ${selectedRace?.name || "-"}`}
          open={Boolean(selectedRace)}
          onCancel={() => setSelectedRace(null)}
          footer={null}
          width={900}
          bodyStyle={{ backgroundColor: "#ffffff", color: "#111827", padding: "20px" }}
          style={{ top: 20 }}
        >
          {selectedRace && (
            <div className="space-y-6 text-gray-900">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">name</p>
                  <p className="font-semibold">{selectedRace.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">raceDate</p>
                  <p className="font-semibold">{formatDateTime(selectedRace.raceDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">location</p>
                  <p className="font-semibold">{selectedRace.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">distanceM</p>
                  <p className="font-semibold">{selectedRace.distanceM} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">status</p>
                  <p className="font-semibold">{selectedRace.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">entryFee</p>
                  <p className="font-semibold">{formatCurrency(selectedRace.entryFee)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">addEntryFeeToPrize</p>
                  <p className="font-semibold">{selectedRace.addEntryFeeToPrize ? "true" : "false"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">prizeMoney</p>
                  <p className="font-semibold">{formatCurrency(selectedRace.prizeMoney)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">__v</p>
                  <p className="font-semibold">{selectedRace.__v}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">createdAt</p>
                  <p className="font-semibold">{formatDateTime(selectedRace.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">updatedAt</p>
                  <p className="font-semibold">{formatDateTime(selectedRace.updatedAt)}</p>
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="mb-3 text-lg font-bold">referee</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => openOddsModal(selectedRace)}
                    className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                  >
                    Thêm tỷ lệ cược
                  </button>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p><span className="text-gray-600">email:</span> {selectedRace.referee?.email || "-"}</p>
                  <p><span className="text-gray-600">fullName:</span> {selectedRace.referee?.fullName || "-"}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-bold">prizeDistribution</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">rank</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRace.prizeDistribution?.map((item) => (
                        <tr key={item._id} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm">{item.rank}</td>
                          <td className="px-4 py-2 text-sm">{item.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-bold">registrations</h3>
                <div className="space-y-3">
                  {selectedRace.registrations?.length ? (
                    selectedRace.registrations.map((registration) => (
                      <div key={registration._id} className="rounded-lg border border-gray-200 p-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <p><span className="text-gray-600">jockeyResponse.status:</span> {registration.jockeyResponse?.status || "-"}</p>
                          <p><span className="text-gray-600">horse:</span> {getEntityLabel(registration.horse)}</p>
                          <p><span className="text-gray-600">jockey:</span> {getEntityLabel(registration.jockey)}</p>
                          <p><span className="text-gray-600">owner:</span> {getEntityLabel(registration.owner)}</p>
                          <p><span className="text-gray-600">approvalStatus:</span> {registration.approvalStatus}</p>
                          <p><span className="text-gray-600">entryFeePaid:</span> {formatCurrency(registration.entryFeePaid)}</p>
                          <p><span className="text-gray-600">hireFee:</span> {formatCurrency(registration.hireFee)}</p>
                          <p><span className="text-gray-600">jockeyBonusPercent:</span> {registration.jockeyBonusPercent}</p>
                          <p><span className="text-gray-600">payoutDone:</span> {registration.payoutDone ? "true" : "false"}</p>
                          <p><span className="text-gray-600">bonusPaid:</span> {registration.bonusPaid ? "true" : "false"}</p>
                          <p><span className="text-gray-600">oddTop1:</span> {registration.oddTop1}</p>
                          <p><span className="text-gray-600">oddTop2:</span> {registration.oddTop2}</p>
                          <p><span className="text-gray-600">oddTop3:</span> {registration.oddTop3}</p>
                          <p><span className="text-gray-600">createdAt:</span> {formatDateTime(registration.createdAt)}</p>
                          <p><span className="text-gray-600">updatedAt:</span> {formatDateTime(registration.updatedAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Không có registration</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          title="Tạo cuộc đua mới"
          open={createModalVisible}
          onCancel={closeCreateModal}
          onOk={handleCreateRace}
          confirmLoading={creating}
          width={720}
          bodyStyle={{ backgroundColor: "#ffffff", color: "#111827", padding: "20px" }}
          okText="Tạo mới"
          cancelText="Hủy"
        >
          <Form form={createForm} layout="vertical">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                name="name"
                label="Tên cuộc đua"
                rules={[{ required: true, message: "Vui lòng nhập tên cuộc đua" }]}
              >
                <Input placeholder="Saigon Spring Derby 2026" />
              </Form.Item>

              <Form.Item
                name="raceDate"
                label="Ngày đua"
                rules={[{ required: true, message: "Vui lòng chọn ngày đua" }]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>

              <Form.Item
                name="registrationCloseAt"
                label="Ngày đóng form"
                rules={[{ required: true, message: "Vui lòng chọn ngày đóng form" }]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>

              <Form.Item
                name="location"
                label="Địa điểm"
                rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
              >
                <Input placeholder="Hanoi Race Track" />
              </Form.Item>

              <Form.Item
                name="distanceM"
                label="Cự ly (m)"
                rules={[{ required: true, message: "Vui lòng nhập cự ly" }]}
              >
                <Input type="number" placeholder="1600" />
              </Form.Item>

              <Form.Item
                name="refereeId"
                label="Referee"
                rules={[{ required: true, message: "Vui lòng chọn referee" }]}
              >
                <Select
                  placeholder="Chọn referee"
                  options={referees.map((ref) => ({
                    label: ref.fullName || ref.username || ref.email || "-",
                    value: ref._id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="Open"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select
                  options={[
                    { label: "Open", value: "Open" },
                    { label: "Draft", value: "Draft" },
                    { label: "Pending", value: "Pending" },
                    { label: "Locked", value: "Locked" },
                    { label: "Finished", value: "Finished" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="prizeMoney"
                label="Prize Money"
                rules={[{ required: true, message: "Vui lòng nhập prize money" }]}
              >
                <Input type="number" placeholder="10000000" />
              </Form.Item>

              <Form.Item
                name="entryFee"
                label="Entry Fee"
                rules={[{ required: true, message: "Vui lòng nhập entry fee" }]}
              >
                <Input type="number" placeholder="500000" />
              </Form.Item>

              <Form.Item
                name="addEntryFeeToPrize"
                valuePropName="checked"
                label="Cộng phí vào thưởng"
              >
                <Checkbox>Thêm entry fee vào prize</Checkbox>
              </Form.Item>

              <Form.Item
                name="invitedOwners"
                label="Mời owner vào cuộc đua"
              >
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Chọn owner"
                  optionFilterProp="label"
                  options={owners.map((owner) => ({
                    label: owner.label,
                    value: owner.value,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="prizeDistribution"
                label="Prize Distribution"
                rules={[{ required: true, message: "Vui lòng nhập prize distribution" }]}
              >
                <Input.TextArea rows={4} placeholder='[{"rank":1,"percent":60}]' />
              </Form.Item>
            </div>
          </Form>
        </Modal>
          <Modal
            title={`Thêm tỷ lệ cược cho ${selectedRace?.name || "cuộc đua"}`}
            open={oddsModalVisible}
            onCancel={closeOddsModal}
            onOk={submitOdds}
            confirmLoading={oddsSubmitting}
            width={760}
            bodyStyle={{ backgroundColor: "#ffffff", color: "#111827", padding: "20px" }}
            okText="Lưu tỷ lệ cược"
            cancelText="Hủy"
          >
            <div className="space-y-4">
              {selectedRace?.registrations?.length ? (
                selectedRace.registrations.map((registration) => {
                  const registrationId = registration._id || registration.registrationId;
                  const values = oddsInputs[registrationId] || { oddTop1: "", oddTop2: "", oddTop3: "" };
                  return (
                    <div key={registrationId} className="rounded-lg border border-gray-200 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-600">Ngựa</p>
                          <p className="font-semibold">{getEntityLabel(registration.horse)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Jockey</p>
                          <p className="font-semibold">{getEntityLabel(registration.jockey)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Owner</p>
                          <p className="font-semibold">{getEntityLabel(registration.owner)}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="block text-sm text-gray-600">
                            oddTop1
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={values.oddTop1}
                              onChange={(e) => handleOddsChange(registrationId, "oddTop1", e.target.value)}
                              placeholder="4.5"
                            />
                          </label>
                          <label className="block text-sm text-gray-600">
                            oddTop2
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={values.oddTop2}
                              onChange={(e) => handleOddsChange(registrationId, "oddTop2", e.target.value)}
                              placeholder="2.2"
                            />
                          </label>
                          <label className="block text-sm text-gray-600">
                            oddTop3
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={values.oddTop3}
                              onChange={(e) => handleOddsChange(registrationId, "oddTop3", e.target.value)}
                              placeholder="1.4"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">Không có đăng ký để thiết lập tỷ lệ cược.</p>
              )}
            </div>
          </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminRaces;
