import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Mail, Briefcase, MapPin, Calendar, Clock4, CheckCircle2, XCircle } from "lucide-react";
import api from "../config/axios";
import { loginSuccess } from "../redux/features/userSlice";

const getDateInputValue = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 10);
};

const getEditableProfile = (profile) => ({
  fullName: profile?.fullName || "",
  phone: profile?.phone || "",
  avatar: profile?.avatar || "",
  address: profile?.address || "",
  dateOfBirth: getDateInputValue(profile?.dateOfBirth),
});

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(getEditableProfile(null));
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/api/auth/me");
        if (response.data?.status === "Success" && response.data?.data) {
          const nextProfile = response.data.data;
          setProfile(nextProfile);
          setProfileForm(getEditableProfile(nextProfile));
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

  const handleFormChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const submitProfileUpdate = async (event) => {
    event.preventDefault();
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    const payload = {
      fullName: profileForm.fullName.trim(),
      phone: profileForm.phone.trim(),
      avatar: profileForm.avatar.trim(),
      address: profileForm.address.trim(),
      dateOfBirth: profileForm.dateOfBirth || undefined,
    };

    try {
      const response = await api.put("/api/enduser/profile", payload);
      if (response.data?.status === "Success") {
        const nextProfile = response.data?.data || { ...profile, ...payload };
        const token = localStorage.getItem("token")?.replaceAll('"', "") || null;
        setProfile(nextProfile);
        setProfileForm(getEditableProfile(nextProfile));
        dispatch(loginSuccess({ user: nextProfile, token }));
        setUpdateSuccess(response.data?.message || "Cập nhật hồ sơ thành công.");
        setUpdateModalOpen(false);
      } else {
        setUpdateError(response.data?.message || "Không thể cập nhật hồ sơ.");
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Lỗi khi cập nhật hồ sơ.");
    } finally {
      setUpdating(false);
    }
  };

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

  const isEndUser = profile?.role === "EndUser";

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

            {!isEndUser && (
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
            )}

            <div className="rounded-3xl bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Địa chỉ</p>
              <p className="mt-3 text-white font-bold">{profile?.address || profile?.stableAddress || "-"}</p>
            </div>

            {isEndUser && (
              <div className="rounded-3xl bg-black/40 p-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Số điện thoại</p>
                  <p className="mt-3 text-white font-bold">{profile?.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Ngày sinh</p>
                  <p className="mt-3 text-white font-bold">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN") : "-"}</p>
                </div>
              </div>
            )}

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

            {isEndUser && (
              <button
                type="button"
                onClick={() => {
                  setProfileForm(getEditableProfile(profile));
                  setUpdateError(null);
                  setUpdateSuccess(null);
                  setUpdateModalOpen(true);
                }}
                className="w-full rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f2cb46]"
              >
                Cập nhật hồ sơ
              </button>
            )}

            {updateSuccess && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{updateSuccess}</div>}
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

      {updateModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8">
          <form onSubmit={submitProfileUpdate} className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[40px] border border-white/10 bg-[#0D1117] p-8 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Cập nhật hồ sơ</p>
                <h3 className="mt-2 text-2xl font-black text-white">Thông tin có thể chỉnh sửa</h3>
                <p className="mt-2 text-sm text-gray-400">Điểm và hạng thành viên được khóa bởi hệ thống.</p>
              </div>
              <button
                type="button"
                onClick={() => !updating && setUpdateModalOpen(false)}
                disabled={updating}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đóng
              </button>
            </div>

            {updateError && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{updateError}</div>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-300">
                Họ và tên
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(event) => handleFormChange("fullName", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className="block text-sm font-semibold text-gray-300">
                Số điện thoại
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) => handleFormChange("phone", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                  placeholder="Nhập số điện thoại"
                />
              </label>

              <label className="block text-sm font-semibold text-gray-300 sm:col-span-2">
                Avatar URL
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(event) => handleFormChange("avatar", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                  placeholder="https://..."
                />
              </label>

              <label className="block text-sm font-semibold text-gray-300 sm:col-span-2">
                Địa chỉ
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(event) => handleFormChange("address", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                  placeholder="Nhập địa chỉ"
                />
              </label>

              <label className="block text-sm font-semibold text-gray-300">
                Ngày sinh
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(event) => handleFormChange("dateOfBirth", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#D9A520]"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !updating && setUpdateModalOpen(false)}
                disabled={updating}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updating}
                className="rounded-2xl bg-[#D9A520] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f2cb46] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Đang cập nhật..." : "Lưu cập nhật"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
