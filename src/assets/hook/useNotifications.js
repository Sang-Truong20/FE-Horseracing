import { useEffect, useState } from "react";
import api from "../../config/axios";

const normalizeNotificationData = (responseData) => {
  const payload = responseData?.data ?? responseData ?? {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const unreadCount =
    typeof payload.unreadCount === "number"
      ? payload.unreadCount
      : items.filter((item) => !item?.read).length;

  return {
    items,
    unreadCount,
  };
};

const useNotifications = ({ unreadOnly = false, limit = 50, enabled = true } = {}) => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    let isMounted = true;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { limit };
        if (unreadOnly) {
          params.unreadOnly = true;
        }

        const response = await api.get("/api/notifications", { params });
        const normalized = normalizeNotificationData(response.data);

        if (!isMounted) return;

        setItems(normalized.items);
        setUnreadCount(normalized.unreadCount);
      } catch (fetchError) {
        if (!isMounted) return;

        setError(fetchError);
        setItems([]);
        setUnreadCount(0);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [enabled, limit, unreadOnly, refreshTick]);

  const refetch = () => setRefreshTick((value) => value + 1);

  return {
    items,
    unreadCount,
    loading,
    error,
    refetch,
  };
};

export default useNotifications;
