import React, { useState } from "react";
import { useDispatch } from "react-redux"; // Cần thiết
import { useNavigate } from "react-router-dom"; // Cần thiết
import { User, Lock, Eye, EyeOff, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import api from "../config/axios";
import { loginSuccess } from "../redux/features/userSlice";

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // PHẢI KHAI BÁO 2 DÒNG NÀY Ở ĐÂY
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post("/api/auth/login", { 
        emailOrUsername, 
        password 
      });

      // Kiểm tra cấu hình trả về từ ảnh của bạn
      if (response.data.status === "Success") {
        const { user, token } = response.data.data || {};

        if (!user || !token) {
          alert("Không nhận được dữ liệu người dùng hợp lệ.");
          return;
        }

        // 1. Lưu vào Redux Store
        dispatch(loginSuccess({ user, token }));

        // 2. Chuyển hướng dựa trên role
        if (user.role === "Admin") {
          navigate("/admin");
        }else if (user.role === "Jockey") {
          navigate("/jockey"); 
        }else if (user.role === "OwnerHorse") {
          navigate("/owner");
        } else {
          alert("Tài khoản của bạn không có quyền truy cập hệ thống");
        }
      } else {
        alert(response.data.message || "Đăng nhập thất bại!");
      }

    } catch (error) {
      // Log lỗi ra console để xem chính xác lỗi gì (Nhấn F12 chọn tab Console)
      console.error("Lỗi thực tế:", error);
      
      const errorMsg = error.response?.data?.message || "Lỗi hệ thống hoặc code xử lý!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0218] via-[#2c063a] to-[#4b0f78] flex items-center justify-center p-6">
      <div className="w-full max-w-lg relative overflow-hidden rounded-3xl bg-[rgba(8,4,20,0.78)] ring-1 ring-white/6 p-10 shadow-[0_30px_90px_rgba(75,17,150,0.18)]">
        <style>{`
          .card-gloss { background: radial-gradient(ellipse at top left, rgba(255,255,255,0.04), transparent 30%); }
        `}</style>
        <motion.div
          className="absolute inset-0 opacity-80 blur-[6px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(255,0,150,0.12), rgba(0,220,200,0.12), rgba(120,0,255,0.12))', backgroundSize: '300% 300%', mixBlendMode: 'screen' }}
          animate={{ x: ['-25%', '25%', '-25%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-gradient-to-tr from-white/6 to-transparent opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white/8 to-transparent opacity-20 pointer-events-none" />
        <div className="flex flex-col items-center gap-3 mb-6 relative z-10">
          <div className="inline-flex items-center gap-3 rounded-full bg-[#0f1220]/60 px-4 py-2 text-[#E9C85A] ring-1 ring-white/6">
            <Trophy size={18} />
            <span className="text-sm font-black">Thunder Track</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Đăng nhập</h2>
          <p className="text-sm text-purple-100 text-center">Quản lý ngựa, jockey và cuộc đua.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="sr-only">Tài khoản</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Tên tài khoản..."
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="w-full bg-transparent pl-10 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="sr-only">Mật khẩu</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent pl-10 pr-10 text-sm text-white outline-none placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded-md border border-white/10 bg-[#03050A] text-[#D9A520]" />
              Ghi nhớ
            </label>
            <button type="button" className="text-[#D9A520]">Quên mật khẩu?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#D9A520] to-[#EBCB75] py-3 text-sm font-black text-black"
          >
            {loading ? "ĐANG..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">© 2026 Thunder Track</p>
        <div className="relative z-10">
          <div className="card-gloss absolute inset-0 pointer-events-none opacity-40" />
        </div>
      </div>
    </div>
  );
};

export default Login;