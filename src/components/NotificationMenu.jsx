/* eslint-disable react/prop-types */
import { useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCcw } from "lucide-react";
import useNotifications from "../assets/hook/useNotifications";

const formatDateTime = (value) => {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const NotificationMenu = ({ buttonClassName = "", unreadDotClassName = "", panelClassName = "", placementClassName = "right-0" }) => {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, loading, error, refetch } = useNotifications({ limit: 50 });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={buttonClassName}
        aria-label="Thông báo"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className={unreadDotClassName}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <div className={`absolute top-full z-50 mt-3 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#0B101A] shadow-2xl ${placementClassName} ${panelClassName}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-black text-white">Thông báo</p>
              <p className="text-[11px] text-gray-500">Inbox của bạn</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refetch}
                className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white"
                aria-label="Làm mới thông báo"
              >
                <RefreshCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-[11px] uppercase tracking-widest text-gray-400 hover:text-white"
              >
                Đóng
              </button>
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {loading ? (
              <div className="flex items-center gap-3 px-4 py-8 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                Đang tải thông báo...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-sm text-red-400">Không thể tải thông báo.</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-400">Chưa có thông báo nào.</div>
            ) : (
              <div className="space-y-2 p-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-2xl border px-4 py-3 transition-colors ${item?.read ? "border-white/5 bg-white/[0.03]" : "border-[#D9A520]/20 bg-[#D9A520]/10"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-bold text-white">{item.title}</h4>
                          {!item?.read && <span className="h-2 w-2 rounded-full bg-[#D9A520]" />}
                        </div>
                        <p className="text-xs leading-5 text-gray-400">{item.body}</p>
                        <p className="text-[11px] uppercase tracking-widest text-gray-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                      {item?.read && <CheckCheck size={16} className="shrink-0 text-emerald-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
