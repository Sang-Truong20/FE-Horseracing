import React, { useEffect, useState } from "react";
import { Alert, Modal, Spin } from "antd";
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
          <div className="flex items-center justify-between border-b border-gray-700 p-6">
            <div>
              <h2 className="text-xl font-bold">Danh Sách Cuộc Đua</h2>
              <p className="text-sm text-gray-400">{races.length} cuộc đua</p>
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
                            <p className="text-xs text-gray-500">ID: {race._id}</p>
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
                  <p className="text-sm text-gray-600">_id</p>
                  <p className="break-all font-semibold">{selectedRace._id}</p>
                </div>
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
                <h3 className="mb-3 text-lg font-bold">referee</h3>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p><span className="text-gray-600">_id:</span> {selectedRace.referee?._id || "-"}</p>
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
                        <th className="px-4 py-2 text-left text-sm font-semibold">_id</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">rank</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRace.prizeDistribution?.map((item) => (
                        <tr key={item._id} className="border-t border-gray-200">
                          <td className="break-all px-4 py-2 text-sm">{item._id}</td>
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
                          <p><span className="text-gray-600">_id:</span> {registration._id}</p>
                          <p><span className="text-gray-600">jockeyResponse.status:</span> {registration.jockeyResponse?.status || "-"}</p>
                          <p><span className="text-gray-600">horse:</span> {registration.horse}</p>
                          <p><span className="text-gray-600">jockey:</span> {registration.jockey}</p>
                          <p><span className="text-gray-600">owner:</span> {registration.owner}</p>
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
      </div>
    </AdminLayout>
  );
};

export default AdminRaces;
