import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Spin } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../config/axios";

const ADMIN_HORSES_API = "/api/admin/horses";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
};

const getStatusBadge = (status) => {
  const badges = {
    Active: "bg-green-500/20 text-green-300",
    Inactive: "bg-gray-500/20 text-gray-300",
    Retired: "bg-yellow-500/20 text-yellow-300",
    Injured: "bg-red-500/20 text-red-300",
  };

  return badges[status] || "bg-gray-500/20 text-gray-300";
};

const AdminOwners = () => {
  const [horses, setHorses] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("all");
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHorses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(ADMIN_HORSES_API);
      const payload = response.data?.status === "Success" ? response.data.data : [];
      setHorses(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      console.error("Fetch horses error:", fetchError);
      setError("Không thể tải danh sách ngựa. Vui lòng thử lại.");
      setHorses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản Lý Chủ Ngựa - Thunder";
    fetchHorses();
  }, []);

  const owners = useMemo(() => {
    const ownerMap = new Map();

    horses.forEach((horse) => {
      if (!horse.owner?._id) return;
      ownerMap.set(horse.owner._id, horse.owner);
    });

    return Array.from(ownerMap.values());
  }, [horses]);

  const filteredHorses = useMemo(() => {
    if (selectedOwnerId === "all") return horses;
    return horses.filter((horse) => horse.owner?._id === selectedOwnerId);
  }, [horses, selectedOwnerId]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản Lý Chủ Ngựa</h1>
          <p className="mt-2 text-gray-400">Lọc danh sách ngựa theo tên chủ ngựa</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Chủ ngựa</label>
            <select
              value={selectedOwnerId}
              onChange={(event) => setSelectedOwnerId(event.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tất cả chủ ngựa</option>
              {owners.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.fullName || owner.stableName || owner.email || "-"}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Tổng chủ ngựa</p>
            <p className="mt-1 text-2xl font-bold text-white">{owners.length}</p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Ngựa đang hiển thị</p>
            <p className="mt-1 text-2xl font-bold text-white">{filteredHorses.length}</p>
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
          <div className="flex items-center justify-between border-b border-gray-700 p-6">
            <div>
              <h2 className="text-xl font-bold">Danh Sách Ngựa</h2>
              <p className="text-sm text-gray-400">{filteredHorses.length} ngựa</p>
            </div>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGỰA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">CHỦ NGỰA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">GIỐNG/MÀU/GIỚI TÍNH</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THỂ TRẠNG</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THÀNH TÍCH</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">JOCKEY HIỆN TẠI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHorses.length > 0 ? (
                    filteredHorses.map((horse) => (
                      <tr key={horse._id} className="border-b border-gray-700 transition hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{horse.name || "-"}</p>
                            <p className="text-xs text-gray-500">{horse.registrationNumber || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p className="font-semibold text-white">{horse.owner?.fullName || "-"}</p>
                            <p className="text-xs text-gray-500">{horse.owner?.stableName || "-"}</p>
                            <p className="text-xs text-gray-500">{horse.owner?.email || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p>Breed: {horse.breed || "-"}</p>
                            <p>Color: {horse.color || "-"}</p>
                            <p>Gender: {horse.gender || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p>{horse.weightKg ?? 0} kg</p>
                            <p>{horse.heightCm ?? 0} cm</p>
                            <p>DOB: {formatDate(horse.dateOfBirth)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p>Races: {horse.totalRaces ?? 0}</p>
                            <p>Wins: {horse.totalWins ?? 0}</p>
                            <p>Speed: {horse.speedRating ?? 0}</p>
                            <p>Stamina: {horse.staminaRating ?? 0}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>
                            <p>{horse.currentJockey?.fullName || "-"}</p>
                            <p className="text-xs text-gray-500">{horse.currentJockey?.licenseNumber || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(horse.status)}`}>
                            {horse.status || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedHorse(horse)}
                            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                        Không có ngựa để hiển thị
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          title={`Chi tiết ngựa: ${selectedHorse?.name || "-"}`}
          open={Boolean(selectedHorse)}
          onCancel={() => setSelectedHorse(null)}
          footer={null}
          width={820}
          bodyStyle={{ backgroundColor: "#ffffff", color: "#111827", padding: "20px" }}
          style={{ top: 20 }}
        >
          {selectedHorse && (
            <div className="space-y-6 text-gray-900">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">name</p>
                  <p className="font-semibold">{selectedHorse.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">breed</p>
                  <p className="font-semibold">{selectedHorse.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">color</p>
                  <p className="font-semibold">{selectedHorse.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">gender</p>
                  <p className="font-semibold">{selectedHorse.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">dateOfBirth</p>
                  <p className="font-semibold">{formatDate(selectedHorse.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">weightKg</p>
                  <p className="font-semibold">{selectedHorse.weightKg}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">heightCm</p>
                  <p className="font-semibold">{selectedHorse.heightCm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">registrationNumber</p>
                  <p className="font-semibold">{selectedHorse.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">status</p>
                  <p className="font-semibold">{selectedHorse.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">totalRaces</p>
                  <p className="font-semibold">{selectedHorse.totalRaces}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">totalWins</p>
                  <p className="font-semibold">{selectedHorse.totalWins}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">speedRating</p>
                  <p className="font-semibold">{selectedHorse.speedRating}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">staminaRating</p>
                  <p className="font-semibold">{selectedHorse.staminaRating}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">createdAt</p>
                  <p className="font-semibold">{formatDate(selectedHorse.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">updatedAt</p>
                  <p className="font-semibold">{formatDate(selectedHorse.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">__v</p>
                  <p className="font-semibold">{selectedHorse.__v}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">notes</p>
                <p className="rounded-lg border border-gray-200 p-3 font-semibold">{selectedHorse.notes || "-"}</p>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-bold">owner</h3>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p><span className="text-gray-600">email:</span> {selectedHorse.owner?.email || "-"}</p>
                  <p><span className="text-gray-600">fullName:</span> {selectedHorse.owner?.fullName || "-"}</p>
                  <p><span className="text-gray-600">stableName:</span> {selectedHorse.owner?.stableName || "-"}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-bold">currentJockey</h3>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p><span className="text-gray-600">fullName:</span> {selectedHorse.currentJockey?.fullName || "-"}</p>
                  <p><span className="text-gray-600">licenseNumber:</span> {selectedHorse.currentJockey?.licenseNumber || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminOwners;
