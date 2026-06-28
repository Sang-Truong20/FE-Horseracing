import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Trophy, Mail, Users } from "lucide-react";
import { motion } from "framer-motion";
import api from "../config/axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "EndUser",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      setError("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không trùng khớp!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Email không hợp lệ!");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });

      if (response.data.status === "Success") {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        setError(response.data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const errorMsg = error.response?.data?.message || "Lỗi hệ thống. Vui lòng thử lại!";
      setError(errorMsg);
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
          <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Đăng ký</h2>
          <p className="text-sm text-purple-100 text-center">Tạo tài khoản để quản lý ngựa, jockey và cuộc đua.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Username */}
          <div>
            <label className="sr-only">Tên tài khoản</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                name="username"
                placeholder="Tên tài khoản..."
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full bg-transparent pl-10 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="sr-only">Họ và tên</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên..."
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full bg-transparent pl-10 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="sr-only">Email</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                name="email"
                placeholder="Email..."
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-transparent pl-10 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Vai trò:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="EndUser">Người dùng thường</option>
              <option value="Jockey">Jockey</option>
              <option value="OwnerHorse">Chủ sở hữu ngựa</option>
              <option value="Referee">Trọng tài</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="sr-only">Mật khẩu</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
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

          {/* Confirm Password */}
          <div>
            <label className="sr-only">Xác nhận mật khẩu</label>
            <div className="relative rounded-xl border border-white/10 bg-[#0B101A] px-4 py-3">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full bg-transparent pl-10 pr-10 text-sm text-white outline-none placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#D9A520] to-[#EBCB75] py-3 text-sm font-black text-black hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {loading ? "ĐANG ĐĂNG KÝ..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Đã có tài khoản?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#D9A520] font-semibold hover:text-[#EBCB75] transition-colors"
          >
            Đăng nhập
          </button>
        </p>

        <p className="mt-2 text-center text-xs text-gray-500">© 2026 Thunder Track</p>
        <div className="relative z-10">
          <div className="card-gloss absolute inset-0 pointer-events-none opacity-40" />
        </div>
      </div>
    </div>
  );
};

export default Register;
