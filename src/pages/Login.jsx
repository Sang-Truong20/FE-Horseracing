import React, { useState } from "react";
import { useDispatch } from "react-redux"; // Cần thiết
import { useNavigate } from "react-router-dom"; // Cần thiết
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
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

        // 2. Chuyển hướng (Dựa trên role OwnerHorse trong ảnh)
        if (user.role === "OwnerHorse") {
          navigate("/owner");
        } else {
          alert("Tài khoản của bạn không có quyền truy cập Owner Portal");
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
    <div className="flex min-h-screen bg-[#05070A] text-white font-sans">
      <div className="flex flex-col justify-center items-center w-full p-6 bg-radial-at-t from-[#0F172A] to-[#05070A]">
        <div className="w-full max-w-md bg-[#0D1117] p-10 rounded-[40px] border border-white/5 shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 border-2 border-[#D9A520]/40 rounded-2xl flex items-center justify-center mb-6 bg-[#D9A520]/5">
                <LogIn className="text-[#D9A520] w-8 h-8" />
             </div>
             <h2 className="text-3xl font-bold mb-3 tracking-tight text-white">Đăng Nhập</h2>
             <p className="text-gray-500 text-center text-sm px-6">
               Chào mừng trở lại! Đăng nhập để quản lý hệ thống đua ngựa.
             </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Tài Khoản</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#D9A520]" />
                <input
                  type="text"
                  placeholder="Nhập tên tài khoản..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#D9A520]/50 transition-all text-sm text-white"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Mật Khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#D9A520]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#D9A520]/50 transition-all text-sm text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D9A520] hover:bg-[#B8860B] text-black font-black py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 uppercase text-xs tracking-widest"
            >
              <LogIn size={18} />
              <span>{loading ? "ĐANG XỬ LÝ..." : "Đăng nhập hệ thống"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;