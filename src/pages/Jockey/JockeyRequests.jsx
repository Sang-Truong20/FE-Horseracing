import React, { useEffect, useState } from 'react';
import { Flag, Calendar, Activity, User, Loader2, Check, X } from 'lucide-react';
import api from '../../config/axios';

const formatDateTime = (value) => {
  if (!value) return 'Không rõ';
  const date = new Date(value);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (value) => {
  if (value == null) return '0 đ';
  if (value === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value)} đ`;
};

const JockeyRequests = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [processingItem, setProcessingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOffer, setConfirmOffer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/jockey/ride-offers');
        const data = response.data?.data ?? response.data ?? [];
        setOffers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải yêu cầu đua:', err);
        setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleDecision = async (offer, action) => {
    const decisionKey = `${offer.raceId}_${offer.registrationId}`;
    try {
      setError(null);
      setMessage(null);
      setProcessingItem(decisionKey);

      const payload = {
        action: action === 'accept' ? 'accept' : 'decline',
        reason: action === 'accept' ? 'Chấp nhận lời mời' : 'Từ chối lời mời',
      };

      await api.patch(`/api/jockey/ride-offers/${offer.raceId}/${offer.registrationId}`, payload);

      setOffers((prevOffers) =>
        prevOffers.filter(
          (item) => !(item.raceId === offer.raceId && item.registrationId === offer.registrationId)
        )
      );

      setMessage(action === 'accept' ? 'Lời mời đã được chấp nhận.' : 'Lời mời đã bị từ chối.');
    } catch (err) {
      console.error('Lỗi khi gửi quyết định:', err);
      setError(err.response?.data?.message || 'Không thể thực hiện thao tác.');
    } finally {
      setProcessingItem(null);
    }
  };

  const openConfirm = (offer, action) => {
    setConfirmOffer(offer);
    setConfirmAction(action);
    setConfirmOpen(true);
    setError(null);
    setMessage(null);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmOffer(null);
    setConfirmAction(null);
  };

  const confirmDecision = async () => {
    if (!confirmOffer || !confirmAction) return;
    closeConfirm();
    await handleDecision(confirmOffer, confirmAction);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-[#EBCB75] rounded-full"></div>
          <h1 className="text-3xl font-bold text-white">Yêu Cầu Đua</h1>
        </div>
        <p className="text-gray-400 text-sm">Danh sách lời mời cưỡi đang chờ phản hồi của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
          <p className="text-sm text-gray-400">Tổng yêu cầu</p>
          <h2 className="text-3xl font-bold text-white">{loading ? '...' : offers.length}</h2>
        </div>
        <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-5">
          <p className="text-sm text-gray-400">Trạng thái</p>
          <h2 className="text-3xl font-bold text-white">{loading ? 'Đang tải...' : offers.length > 0 ? 'Chờ phản hồi' : 'Không có yêu cầu'}</h2>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[#EBCB75]">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Đang tải danh sách yêu cầu đua...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-[#1C152B] rounded-2xl border border-red-500/20 p-6 text-red-200">
          <p className="font-semibold mb-2">Lỗi:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && message && (
        <div className="bg-emerald-500/10 rounded-2xl border border-emerald-400/20 p-6 text-emerald-100">
          <p>{message}</p>
        </div>
      )}

      {confirmOpen && confirmOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-[#0F0B19] border border-white/10 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Xác nhận quyết định</h3>
                <p className="mt-2 text-sm text-gray-400">
                  {confirmAction === 'accept'
                    ? 'Bạn có chắc chắn đồng ý với lời mời cưỡi này không?'
                    : 'Bạn có chắc chắn muốn từ chối lời mời cưỡi này không?'}
                </p>
              </div>
              <button onClick={closeConfirm} className="text-gray-400 hover:text-white">
                Đóng
              </button>
            </div>

            <div className="mt-5 rounded-3xl bg-[#15131f] border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Cuộc đua</p>
              <p className="mt-2 text-lg font-semibold text-white">{confirmOffer.raceName}</p>
              <p className="mt-3 text-sm text-gray-400">Ngựa: {confirmOffer.horse?.name || 'Không có'}</p>
              <p className="text-sm text-gray-400">Chủ nuôi: {confirmOffer.owner?.fullName || 'Không có'}</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeConfirm}
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#1c172c] px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmDecision}
                className="w-full sm:w-auto rounded-xl bg-[#EBCB75] px-4 py-3 text-sm font-semibold text-black hover:bg-[#d9a520] transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <div className="bg-[#1C152B] rounded-2xl border border-white/5 p-10 text-center text-gray-400">
          <Activity className="mx-auto mb-4 text-[#EBCB75]" size={48} />
          <p className="text-lg font-semibold text-white">Hiện tại không có yêu cầu đua nào.</p>
          <p>Hãy kiểm tra lại sau hoặc liên hệ chủ nhân để biết thêm thông tin.</p>
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="grid gap-6">
          {offers.map((offer) => (
            <div key={offer.registrationId ?? offer.raceId} className="bg-[#1C152B] rounded-3xl border border-white/5 p-6 shadow-sm hover:border-[#EBCB75]/30 transition">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">
                <div>
                  <span className="inline-flex items-center gap-2 text-sm text-[#EBCB75] font-semibold uppercase tracking-[0.2em]">
                    <Flag size={16} /> {offer.raceName}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-white">{offer.raceName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Ngày đua</p>
                  <p className="text-lg font-semibold text-white">{formatDateTime(offer.raceDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
                <div className="rounded-2xl bg-[#150F22] border border-white/5 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.12em] mb-2">Ngựa</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#EBCB75]/10 flex items-center justify-center text-[#EBCB75]">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{offer.horse?.name || 'Không có'}</p>
                      <p className="text-xs text-gray-400">{offer.horse?.registrationNumber || '---'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#150F22] border border-white/5 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.12em] mb-2">Chủ nuôi</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{offer.owner?.fullName || 'Không có'}</p>
                      <p className="text-xs text-gray-400">{offer.owner?.stableName || '---'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#150F22] border border-white/5 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.12em] mb-2">Phí thuê</p>
                  <p className="text-2xl font-bold text-white">{formatMoney(offer.hireFee)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="text-gray-400 text-sm">
                  <p>Trạng thái: <span className="text-[#EBCB75]">Chờ phản hồi</span></p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={processingItem === `${offer.raceId}_${offer.registrationId}`}
                    onClick={() => openConfirm(offer, 'accept')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EBCB75] text-black font-semibold hover:bg-[#d9a520] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={16} /> Chấp nhận
                  </button>
                  <button
                    disabled={processingItem === `${offer.raceId}_${offer.registrationId}`}
                    onClick={() => openConfirm(offer, 'reject')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={16} /> Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JockeyRequests;
