import React, { useEffect, useState } from "react";
import { Wallet, History, AlertCircle } from "lucide-react";
import api from "../../config/axios";

const JockeyWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/wallet");
      if (response.data?.status === "Success") {
        setWallet(response.data.data);
        setTransactions(response.data.data?.transactions || []);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
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

      <div className="bg-[#0D1117] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="bg-blue-500/20 p-3 rounded-2xl">
            <History size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Lịch Sử Giao Dịch</h3>
            <p className="text-xs text-gray-400 mt-1">Tất cả giao dịch liên quan tới ví của bạn.</p>
          </div>
        </div>

        <div className="p-8">
          {error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : loading ? (
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
                      <Wallet
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
                        {tx.date ? new Date(tx.date).toLocaleDateString("vi-VN") : "---"}
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
                      {tx.type === "income" ? "+" : "-"} ₫ {tx.amount?.toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Lưu Ý Bảo Mật</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Không chia sẻ thông tin ví của bạn với bất kỳ ai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JockeyWallet;
