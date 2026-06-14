import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Mail, Briefcase, MapPin, Hash, Calendar, Clock4, CheckCircle2, XCircle } from "lucide-react";
import api from "../config/axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/api/auth/me");
        if (response.data?.status === "Success" && response.data?.data) {
          setProfile(response.data.data);
        } else {
          setError(response.data?.message || "Không thể tải thông tin người dùng.");
        }
      } catch (err) {
        console.error("Lỗi khi gọi auth/me:", err);
        setError(err.response?.data?.message || "Lỗi khi tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-[#0D1117] border border-white/5 text-gray-300">
        <p className="text-sm text-gray-400">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-[#0D1117] border border-white/5 text-gray-300">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between rounded-[40px] bg-[#0D1117] border border-white/5 p-8 shadow-2xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Hồ sơ người dùng</p>
          <h1 className="mt-3 text-4xl font-black text-white">Thông tin cá nhân</h1>
          <p className="mt-3 text-sm text-gray-400 max-w-2xl">
            Thông tin tài khoản được lấy trực tiếp từ API `auth/me` và hiển thị ở đây.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
        >
          Quay lại
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[40px] bg-[#0D1117] border border-white/5 p-8 shadow-2xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#D9A520] to-[#B8860B] text-black text-3xl font-black">
              {profile?.fullName?.charAt(0) || profile?.username?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Username</p>
              <h2 className="mt-2 text-2xl font-black text-white">{profile?.username || "-"}</h2>
              <p className="mt-1 text-sm text-gray-400">{profile?.email || "-"}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Họ và tên</p>
                <p className="mt-3 text-lg font-bold text-white">{profile?.fullName || "-"}</p>
              </div>
              <div className="rounded-3xl bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Vai trò</p>
                <p className="mt-3 text-lg font-bold text-white">{profile?.role || "-"}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-black/40 p-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Công ty / Stable</p>
                <p className="mt-3 text-white font-bold">{profile?.companyName || profile?.stableName || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Mã số thuế</p>
                <p className="mt-3 text-white font-bold">{profile?.taxCode || "-"}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Địa chỉ</p>
              <p className="mt-3 text-white font-bold">{profile?.stableAddress || "-"}</p>
            </div>

            <div className="rounded-3xl bg-black/40 p-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Trạng thái</p>
                <p className="mt-3 flex items-center gap-2 text-white font-bold">
                  {profile?.status || "-"}
                  {profile?.isVerified ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Phương thức auth</p>
                <p className="mt-3 text-white font-bold">{profile?.authProvider || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[40px] bg-[#0D1117] border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={24} className="text-[#D9A520]" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Bảo mật</p>
                <h3 className="text-xl font-bold text-white">Thông tin đăng nhập</h3>
              </div>
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-2"><User size={16} className="text-[#D9A520]" /><span>Username</span></div>
                <span className="font-semibold text-white">{profile?.username || "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-2"><Mail size={16} className="text-[#D9A520]" /><span>Email</span></div>
                <span className="font-semibold text-white">{profile?.email || "-"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[40px] bg-[#0D1117] border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={24} className="text-[#D9A520]" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Hoạt động</p>
                <h3 className="text-xl font-bold text-white">Lịch sử tài khoản</h3>
              </div>
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-2"><Calendar size={16} className="text-[#D9A520]" /><span>Tạo lúc</span></div>
                <span className="font-semibold text-white">{profile?.createdAt ? new Date(profile.createdAt).toLocaleString("vi-VN") : "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-2"><Clock4 size={16} className="text-[#D9A520]" /><span>Cập nhật lúc</span></div>
                <span className="font-semibold text-white">{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString("vi-VN") : "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-2"><Briefcase size={16} className="text-[#D9A520]" /><span>Last login</span></div>
                <span className="font-semibold text-white">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString("vi-VN") : "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
