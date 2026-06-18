import React, { useEffect, useState } from "react";
import { Wallet, Send, TrendingUp, History, AlertCircle, CreditCard } from "lucide-react";
import api from "../../config/axios";

const ManageWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [transactionType, setTransactionType] = useState("all");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState(null);
  const [depositMessage, setDepositMessage] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawAccountName, setWithdrawAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawInfo, setWithdrawInfo] = useState(null);
  const [withdrawError, setWithdrawError] = useState(null);
  const [withdrawMessage, setWithdrawMessage] = useState(null);

  const transactionTypeOptions = [
    { value: "all", label: "Tất cả" },
    { value: "Deposit", label: "Deposit" },
    { value: "Refund", label: "Refund" },
    { value: "Prize", label: "Prize" },
    { value: "HireFeeIn", label: "HireFeeIn" },
    { value: "Bonus", label: "Bonus" },
    { value: "Withdraw", label: "Withdraw" },
    { value: "EntryFee", label: "EntryFee" },
    { value: "HireFeeOut", label: "HireFeeOut" },
    { value: "Adjustment", label: "Adjustment" },
  ];

  const getTransactionMeta = (type, amount) => {
    const normalizedType = type || "Adjustment";
    const creditTypes = ["Deposit", "Refund", "Prize", "HireFeeIn", "Bonus"];
    const debitTypes = ["Withdraw", "EntryFee", "HireFeeOut"];
    const isCredit = creditTypes.includes(normalizedType);
    const isDebit = debitTypes.includes(normalizedType);
    const direction = isCredit ? "credit" : isDebit ? "debit" : Number(amount) < 0 ? "debit" : "credit";

    const labels = {
      Deposit: "Nạp qua VNPay",
      Refund: "Hoàn entry fee",
      Prize: "Tiền thưởng race",
      HireFeeIn: "Jockey nhận tiền thuê",
      Bonus: "Jockey nhận bonus %",
      Withdraw: "Yêu cầu rút",
      EntryFee: "Owner trả phí đăng ký race",
      HireFeeOut: "Owner trả tiền thuê jockey",
      Adjustment: "Admin override",
    };

    return {
      type: normalizedType,
      label: labels[normalizedType] || normalizedType,
      direction,
      toneClass: direction === "debit" ? "text-red-400" : "text-green-400",
      badgeClass: direction === "debit" ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300",
    };
  };

  const extractTransactions = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.transactions || payload?.items || payload?.data || [];
  };

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/wallet");
      if (response.data?.status === "Success") {
        setWallet(response.data.data);
      } else {
        setError(response.data?.message || "Không thể tải dữ liệu ví");
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin ví:", err);
      setError(err.response?.data?.message || err.message || "Lỗi khi gọi API ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDeposit = async () => {
    setDepositError(null);
    setDepositMessage(null);

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositError("Vui lòng nhập số tiền nạp hợp lệ");
      return;
    }

    setDepositing(true);
    try {
      const response = await api.post("/api/wallet/deposit", {
        amount: parseFloat(depositAmount),
      });
      const data = response.data?.data ?? response.data ?? {};
      const paymentUrl = data.paymentUrl;
      const txId = data.txId;

      if (!paymentUrl) {
        setDepositError(response.data?.message || "Không tạo được liên kết thanh toán VNPay");
        return;
      }

      // Lưu txId để trang /payment-result có thể poll trạng thái sau khi VNPay redirect về.
      if (txId) localStorage.setItem("pendingDepositTxId", txId);
      setDepositMessage("Đang chuyển hướng tới cổng thanh toán VNPay...");
      window.location.href = paymentUrl;
    } catch (err) {
      setDepositError(err.response?.data?.message || "Lỗi khi tạo lệnh nạp");
    } finally {
      setDepositing(false);
    }
  };

  const fetchTransactions = async (nextType = transactionType) => {
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const params = { limit: 50 };
      if (nextType && nextType !== "all") params.type = nextType;

      const response = await api.get("/api/wallet/transactions", { params });
      if (response.data?.status === "Success") {
        setTransactions(extractTransactions(response.data.data));
      } else {
        setTransactionsError(response.data?.message || "Không thể tải lịch sử giao dịch");
      }
    } catch (err) {
      setTransactionsError(err.response?.data?.message || err.message || "Lỗi khi gọi API lịch sử giao dịch");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleToggleTransactions = async () => {
    const nextOpen = !showTransactions;
    setShowTransactions(nextOpen);
    if (nextOpen && transactions.length === 0) {
      await fetchTransactions(transactionType);
    }
  };

  const handleTransactionTypeChange = async (type) => {
    setTransactionType(type);
    setShowTransactions(true);
    await fetchTransactions(type);
  };

  const handleWithdraw = async () => {
    setWithdrawError(null);
    setWithdrawMessage(null);

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!withdrawBankName || withdrawBankName.trim() === "") {
      setWithdrawError("Vui lòng nhập tên ngân hàng");
      return;
    }

    if (!withdrawAccountNumber || withdrawAccountNumber.trim() === "") {
      setWithdrawError("Vui lòng nhập số tài khoản");
      return;
    }

    if (!withdrawAccountName || withdrawAccountName.trim() === "") {
      setWithdrawError("Vui lòng nhập tên chủ tài khoản");
      return;
    }

    setWithdrawing(true);
    setWithdrawInfo(null);
    try {
      const response = await api.post("/api/wallet/withdraw", {
        amount: parseFloat(withdrawAmount),
        bankName: withdrawBankName,
        accountNumber: withdrawAccountNumber,
        accountName: withdrawAccountName,
      });
      if (response.data?.status === "Success") {
        setWithdrawInfo(response.data.data || null);
        setWithdrawMessage("Yêu cầu rút tiền đã được gửi. Vui lòng chờ admin duyệt.");
        setWithdrawAmount("");
        setWithdrawBankName("");
        setWithdrawAccountNumber("");
        setWithdrawAccountName("");
        fetchWallet();
      } else {
        setWithdrawError(response.data?.message || "Rút tiền thất bại");
      }
    } catch (err) {
      setWithdrawError(err.response?.data?.message || "Lỗi khi rút tiền");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* WALLET BALANCE CARD */}
      <div className="bg-gradient-to-br from-[#D9A520] to-[#B8860B] rounded-[40px] border border-[#D9A520]/20 overflow-hidden shadow-2xl p-8 text-black">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-80">Số Dư Ví</p>
            <h2 className="text-5xl font-black mt-2">
              {loading ? "Đang tải..." : wallet ? `₫ ${wallet.balance?.toLocaleString("vi-VN")}` : "-"}
            </h2>
          </div>
          <div className="bg-black/20 p-4 rounded-2xl">
            <Wallet size={32} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-black/20 pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Tổng Thu</p>
            <p className="text-2xl font-black">₫ {wallet?.totalIncome?.toLocaleString("vi-VN") || "0"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Tổng Chi</p>
            <p className="text-2xl font-black">₫ {wallet?.totalExpense?.toLocaleString("vi-VN") || "0"}</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Section */}
        <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#D9A520]/20 p-3 rounded-2xl">
              <CreditCard size={24} className="text-[#D9A520]" />
            </div>
            <h3 className="text-lg font-bold text-white">Nạp Tiền</h3>
          </div>

          <div className="space-y-4">
            {depositError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {depositError}
              </div>
            )}
            {depositMessage && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {depositMessage}
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Số Tiền Nạp
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">₫</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D9A520]/50 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Bạn sẽ được chuyển sang cổng VNPay để hoàn tất thanh toán.</p>
            </div>

            <button
              onClick={handleDeposit}
              disabled={depositing || parseFloat(depositAmount) <= 0}
              className="w-full bg-[#D9A520] text-black font-bold py-3 rounded-xl hover:bg-[#B8860B] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-tighter"
            >
              {depositing ? "Đang chuyển hướng..." : "Nạp Tiền Qua VNPay"}
            </button>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-3 rounded-2xl">
              <Send size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Rút Tiền</h3>
          </div>

          <div className="space-y-4">
            {withdrawError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {withdrawError}
              </div>
            )}
            {withdrawMessage && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {withdrawMessage}
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Số Tiền Rút
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">₫</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Số dư hiện có: ₫ {wallet?.balance?.toLocaleString("vi-VN") || "0"}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Tên Ngân Hàng
              </label>
              <input
                type="text"
                value={withdrawBankName}
                onChange={(e) => setWithdrawBankName(e.target.value)}
                placeholder="Vd: Vietcombank, Techcombank..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Số Tài Khoản
              </label>
              <input
                type="text"
                value={withdrawAccountNumber}
                onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                placeholder="Nhập số tài khoản..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Tên Chủ Tài Khoản
              </label>
              <input
                type="text"
                value={withdrawAccountName}
                onChange={(e) => setWithdrawAccountName(e.target.value)}
                placeholder="Nhập tên chủ tài khoản..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawing || !wallet || parseFloat(withdrawAmount) <= 0 || !withdrawBankName.trim() || !withdrawAccountNumber.trim() || !withdrawAccountName.trim()}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-tighter"
            >
              {withdrawing ? "Đang xử lý..." : "Rút Tiền"}
            </button>

            {withdrawInfo && (
              <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-400">Số tiền</span>
                  <span className="font-bold text-white">₫ {withdrawInfo.amount?.toLocaleString("vi-VN") || "0"}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Ngân hàng</p>
                    <p className="rounded-xl bg-black/40 px-4 py-3 text-sm font-bold text-white break-all">
                      {withdrawInfo.bankName || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Số tài khoản</p>
                    <p className="rounded-xl bg-black/40 px-4 py-3 text-sm font-bold text-white break-all">
                      {withdrawInfo.accountNumber || "-"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Tên chủ tài khoản</p>
                  <p className="rounded-xl bg-black/40 px-4 py-3 text-sm font-bold text-white break-all">
                    {withdrawInfo.accountName || "-"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-2xl">
                <TrendingUp size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Thống Kê</h3>
            </div>
            <button
              onClick={handleToggleTransactions}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
            >
              {showTransactions ? "Ẩn lịch sử" : "Xem lịch sử giao dịch"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
              <span className="text-sm text-gray-400">Tổng giao dịch</span>
              <span className="text-lg font-bold text-white">
                {transactions.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
              <span className="text-sm text-gray-400">Loại giao dịch</span>
              <span className="text-lg font-bold text-[#D9A520]">
                {transactions.length > 0 ? "Cập nhật" : "Chưa có"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      {showTransactions && (
        <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-2xl">
              <History size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Lịch Sử Giao Dịch</h3>
              <p className="text-xs text-gray-400 mt-1">Tất cả các giao dịch trong ví của bạn</p>
            </div>
          </div>

          <div className="px-8 pt-6 flex flex-wrap gap-2">
            {transactionTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTransactionTypeChange(option.value)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  transactionType === option.value
                    ? "border-[#D9A520] bg-[#D9A520] text-black"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {transactionsLoading ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Đang tải lịch sử giao dịch...</p>
              </div>
            ) : transactionsError ? (
              <div className="text-center py-12 text-red-400">{transactionsError}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((tx, idx) => {
                  const meta = getTransactionMeta(tx.type, tx.amount);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${meta.badgeClass}`}>
                          {meta.type}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{meta.label}</p>
                          <p className="text-xs text-gray-500">
                            {tx.date ? new Date(tx.date).toLocaleDateString("vi-VN") : "---"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${meta.toneClass}`}>
                          {meta.direction === "debit" ? "-" : "+"} ₫ {Number(tx.amount || 0).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WARNING */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Lưu Ý Bảo Mật</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Không chia sẻ thông tin ví của bạn với bất kỳ ai. Tất cả giao dịch rút tiền sẽ được xử lý trong 1-3 ngày làm việc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageWallet;
