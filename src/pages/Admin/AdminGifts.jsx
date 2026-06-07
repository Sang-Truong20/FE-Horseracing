import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Spin, message } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";

const ADMIN_GIFTS_API = "/api/admin/gifts";

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
};

const getActiveBadge = (active) =>
  active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300";

const AdminGifts = () => {
  const [gifts, setGifts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedGift, setSelectedGift] = useState(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newGift, setNewGift] = useState({
    name: "",
    description: "",
    pointsCost: 0,
    quantity: 0,
    imageFile: null,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetNewGift = () => {
    setNewGift({
      name: "",
      description: "",
      pointsCost: 0,
      quantity: 0,
      imageFile: null,
      active: true,
    });
  };

  const handleCreateGift = async () => {
    try {
      setCreateLoading(true);
      let response;

      if (newGift.imageFile) {
        const formData = new FormData();
        formData.append("name", newGift.name);
        formData.append("description", newGift.description);
        formData.append("pointsCost", Number(newGift.pointsCost));
        formData.append("quantity", Number(newGift.quantity));
        formData.append("active", newGift.active);
        formData.append("image", newGift.imageFile);

        response = await api.post(ADMIN_GIFTS_API, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await api.post(ADMIN_GIFTS_API, {
          name: newGift.name,
          description: newGift.description,
          pointsCost: Number(newGift.pointsCost),
          quantity: Number(newGift.quantity),
          imageUrl: "",
          active: newGift.active,
        });
      }

      if (response.data?.status === "Success" || response.status === 201) {
        message.success("Tạo quà tặng thành công");
        setIsCreateModalVisible(false);
        resetNewGift();
        fetchGifts();
      } else {
        message.error(response.data?.message || "Tạo quà tặng thất bại");
      }
    } catch (err) {
      console.error("Create gift error:", err);
      message.error(err.response?.data?.message || err.message || "Tạo quà tặng thất bại");
    } finally {
      setCreateLoading(false);
    }
  };

  const fetchGifts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(ADMIN_GIFTS_API);
      const payload = response.data?.status === "Success" ? response.data.data : [];
      setGifts(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      console.error("Fetch gifts error:", fetchError);
      setError("Không thể tải danh sách quà tặng. Vui lòng thử lại.");
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quà Tặng Admin - Thunder";
    fetchGifts();
  }, []);

  const filteredGifts = useMemo(() => {
    if (activeFilter === "all") return gifts;
    return gifts.filter((gift) => gift.active === (activeFilter === "true"));
  }, [gifts, activeFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quà Tặng</h1>
          <p className="mt-2 text-gray-400">Xem danh sách quà tặng đổi bằng điểm trong hệ thống</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Trạng thái</label>
            <select
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Tổng quà tặng</p>
            <p className="mt-1 text-2xl font-bold text-white">{gifts.length}</p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Đang hiển thị</p>
            <p className="mt-1 text-2xl font-bold text-white">{filteredGifts.length}</p>
          </div>
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
              <h2 className="text-xl font-bold">Danh Sách Quà Tặng</h2>
              <p className="text-sm text-gray-400">{filteredGifts.length} quà tặng</p>
            </div>
            <button
              onClick={() => setIsCreateModalVisible(true)}
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Tạo quà tặng mới
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">QUÀ TẶNG</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">MÔ TẢ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ĐIỂM ĐỔI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">SỐ LƯỢNG</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGÀY TẠO</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGifts.length > 0 ? (
                    filteredGifts.map((gift) => (
                      <tr key={gift._id} className="border-b border-gray-700 transition hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-700">
                              {gift.imageUrl ? (
                                <img src={gift.imageUrl} alt={gift.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
                              )}
                            </div>
                            <p className="font-semibold text-white">{gift.name || "-"}</p>
                          </div>
                        </td>
                        <td className="max-w-xs px-6 py-4 text-sm text-gray-300">{gift.description || "-"}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{gift.pointsCost ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{gift.quantity ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getActiveBadge(gift.active)}`}>
                            {gift.active ? "Đang hoạt động" : "Không hoạt động"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(gift.createdAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedGift(gift)}
                            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                        Không có quà tặng để hiển thị
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          title={`Chi tiết quà tặng: ${selectedGift?.name || "-"}`}
          open={Boolean(selectedGift)}
          onCancel={() => setSelectedGift(null)}
          footer={null}
          width={720}
          bodyStyle={{ backgroundColor: "#ffffff", color: "#111827", padding: "20px" }}
          style={{ top: 20 }}
        >
          {selectedGift && (
            <div className="space-y-5 text-gray-900">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Tên quà</p>
                  <p className="font-semibold">{selectedGift.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-semibold">{selectedGift.active ? "Đang hoạt động" : "Không hoạt động"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điểm đổi</p>
                  <p className="font-semibold">{selectedGift.pointsCost ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số lượng</p>
                  <p className="font-semibold">{selectedGift.quantity ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-semibold">{formatDateTime(selectedGift.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày cập nhật</p>
                  <p className="font-semibold">{formatDateTime(selectedGift.updatedAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Mô tả</p>
                <p className="rounded-lg border border-gray-200 p-3 font-semibold">{selectedGift.description || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Hình ảnh</p>
                {selectedGift.imageUrl ? (
                  <img src={selectedGift.imageUrl} alt={selectedGift.name} className="mt-2 max-h-64 rounded-lg border border-gray-200 object-cover" />
                ) : (
                  <p className="mt-2 rounded-lg border border-gray-200 p-3 text-gray-500">Không có hình ảnh</p>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          title="Tạo quà tặng mới"
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          onOk={handleCreateGift}
          confirmLoading={createLoading}
          okText="Tạo"
          cancelText="Hủy"
          width={720}
          bodyStyle={{ backgroundColor: "#ffffff", color: "#111827", padding: "20px" }}
          style={{ top: 20 }}
        >
          <div className="space-y-4 text-gray-900">
            <div>
              <label className="text-sm text-gray-600">Tên quà</label>
              <input
                type="text"
                value={newGift.name}
                onChange={(event) => setNewGift((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
                placeholder="Áo phông HorseManage"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Mô tả</label>
              <textarea
                value={newGift.description}
                onChange={(event) => setNewGift((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
                placeholder="Mô tả quà tặng"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">Điểm đổi</label>
                <input
                  type="number"
                  value={newGift.pointsCost}
                  onChange={(event) => setNewGift((prev) => ({ ...prev, pointsCost: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
                  placeholder="300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Số lượng</label>
                <input
                  type="number"
                  value={newGift.quantity}
                  onChange={(event) => setNewGift((prev) => ({ ...prev, quantity: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
                  placeholder="20"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Ảnh quà tặng</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setNewGift((prev) => ({
                    ...prev,
                    imageFile: event.target.files?.[0] || null,
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
              />
              {newGift.imageFile && (
                <p className="mt-2 text-sm text-gray-500">Đã chọn: {newGift.imageFile.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                id="gift-active"
                type="checkbox"
                checked={newGift.active}
                onChange={(event) => setNewGift((prev) => ({ ...prev, active: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="gift-active" className="text-sm text-gray-600">Kích hoạt quà tặng</label>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminGifts;
