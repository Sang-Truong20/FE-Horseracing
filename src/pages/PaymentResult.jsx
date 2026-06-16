import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import api from "../config/axios";

const POLL_INTERVAL = 2500; // 2.5s
const MAX_ATTEMPTS = 24; // ~60s tổng cộng

const resolveWalletPath = (role) => {
  if (role === "OwnerHorse") return "/owner/wallet";
  if (role === "Jockey") return "/jockey/wallet";
  return "/";
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [status, setStatus] = useState("Pending");
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(null);

  const attemptsRef = useRef(0);
  const timerRef = useRef(null);

  const txId = searchParams.get("txId") || localStorage.getItem("pendingDepositTxId");
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const walletPath = resolveWalletPath(user?.role);

  useEffect(() => {
    if (!txId) {
      setStatus("Failed");
      setError("Không tìm thấy mã giao dịch.");
      return undefined;
    }

    // VNPay báo hủy/thất bại ngay trên query thì dừng sớm, không cần poll.
    if (vnpResponseCode && vnpResponseCode !== "00") {
      setStatus("Failed");
      setError("Giao dịch bị hủy hoặc thất bại trên VNPay.");
      localStorage.removeItem("pendingDepositTxId");
      return undefined;
    }

    const finish = (nextStatus) => {
      setStatus(nextStatus);
      localStorage.removeItem("pendingDepositTxId");
    };

    const poll = async () => {
      try {
        const res = await api.get(`/api/wallet/deposit/${txId}/status`);
        const data = res.data?.data ?? res.data ?? {};
        const current = data.status ?? data.state;

        if (data.amount != null) setAmount(data.amount);

        if (["Success", "success", "Completed", "completed"].includes(current)) {
          finish("Success");
          return;
        }
        if (["Failed", "failed", "Rejected", "rejected", "Cancelled", "cancelled"].includes(current)) {
          finish("Failed");
          return;
        }

        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setStatus("Timeout");
          return;
        }
        timerRef.current = setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setStatus("Failed");
          setError(err.response?.data?.message || "Không kiểm tra được trạng thái giao dịch.");
          return;
        }
        timerRef.current = setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();

    return () => clearTimeout(timerRef.current);
  }, [txId, vnpResponseCode]);

  const formattedAmount =
    amount != null ? `₫ ${Number(amount).toLocaleString("vi-VN")}` : null;

  const renderIcon = () => {
    if (status === "Success") return <CheckCircle2 size={56} className="text-emerald-400" />;
    if (status === "Failed") return <XCircle size={56} className="text-red-400" />;
    if (status === "Timeout") return <Clock size={56} className="text-orange-400" />;
    return <Loader2 size={56} className="text-[#D9A520] animate-spin" />;
  };

  const renderTitle = () => {
    if (status === "Success") return "Nạp tiền thành công";
    if (status === "Failed") return "Nạp tiền thất bại";
    if (status === "Timeout") return "Đang chờ xác nhận";
    return "Đang xử lý giao dịch...";
  };

  const renderMessage = () => {
    if (status === "Success") {
      return formattedAmount
        ? `Đã nạp ${formattedAmount} vào ví của bạn.`
        : "Số dư ví của bạn đã được cập nhật.";
    }
    if (status === "Failed") return error || "Giao dịch không thành công. Vui lòng thử lại.";
    if (status === "Timeout")
      return "Giao dịch chưa được xác nhận. Số dư sẽ tự cập nhật khi VNPay xử lý xong.";
    return "Vui lòng chờ trong giây lát, hệ thống đang xác nhận thanh toán với VNPay.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070C] p-6">
      <div className="w-full max-w-md rounded-[32px] border border-white/5 bg-[#0D1117] p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">{renderIcon()}</div>
        <h1 className="text-2xl font-black text-white mb-2">{renderTitle()}</h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">{renderMessage()}</p>

        {txId && (
          <p className="text-xs text-gray-600 mb-6 break-all">Mã giao dịch: {txId}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate(walletPath)}
            className="w-full bg-[#D9A520] text-black font-bold py-3 rounded-xl hover:bg-[#B8860B] transition-all text-sm uppercase tracking-tighter"
          >
            Về trang ví
          </button>
          {(status === "Failed" || status === "Timeout") && (
            <button
              onClick={() => navigate(walletPath)}
              className="w-full bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Thử nạp lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
