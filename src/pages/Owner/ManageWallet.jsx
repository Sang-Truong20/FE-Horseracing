import React, { useEffect, useState } from "react";
import { Wallet, DollarSign, Send, TrendingUp, History, AlertCircle } from "lucide-react";
import api from "../../config/axios";

const ManageWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/wallet");
      if (response.data?.status === "Success") {
        setWallet(response.data.data);
        setTransactions(response.data.data?.transactions || []);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin ví:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setWithdrawing(true);
    try {
      const response = await api.post("/api/wallet/withdraw", {
        amount: parseFloat(withdrawAmount),
      });
      if (response.data?.status === "Success") {
        alert("Rút tiền thành công!");
        setWithdrawAmount("");
        fetchWallet();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi rút tiền");
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
              {wallet ? `₫ ${wallet.balance?.toLocaleString("vi-VN")}` : "Đang tải..."}
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
        {/* Withdraw Section */}
        <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-3 rounded-2xl">
              <Send size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Rút Tiền</h3>
          </div>

          <div className="space-y-4">
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

            <button
              onClick={handleWithdraw}
              disabled={withdrawing || !wallet || parseFloat(withdrawAmount) <= 0}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-tighter"
            >
              {withdrawing ? "Đang xử lý..." : "Rút Tiền"}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/20 p-3 rounded-2xl">
              <TrendingUp size={24} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Thống Kê</h3>
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
      <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="bg-blue-500/20 p-3 rounded-2xl">
            <History size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Lịch Sử Giao Dịch</h3>
            <p className="text-xs text-gray-400 mt-1">
              Tất cả các giao dịch trong ví của bạn
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Đang tải lịch sử giao dịch...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl ${
                        tx.type === "income"
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      <DollarSign
                        size={20}
                        className={
                          tx.type === "income"
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {tx.description || "Giao dịch"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-sm ${
                        tx.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"} ₫{" "}
                      {tx.amount?.toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
