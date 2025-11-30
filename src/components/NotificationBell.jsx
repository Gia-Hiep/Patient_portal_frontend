import React, { useEffect, useState } from "react";
import { fetchUnreadCount } from "../services/userNotifications";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let timer;
    let isMounted = true;

    const load = async () => {
      try {
        const c = await fetchUnreadCount();
        if (!isMounted) return;
        setPrevCount((old) => {
          if (c > old) {
            setToast("Bạn có thông báo mới, vào mục Thông báo tự động để xem.");
            setTimeout(() => setToast(""), 4000);
          }
          return c;
        });
        setCount(c);
      } catch (e) {
        // ignore quietly
      }
    };

    load();
    timer = setInterval(load, 30000); // 30s

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <div
        style={{ position: "relative", cursor: "default" }}
        title="Thông báo"
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#ef4444",
              color: "#fff",
              borderRadius: "999px",
              padding: "0 6px",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            {count}
          </span>
        )}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            background: "#111827",
            color: "#f9fafb",
            padding: "10px 14px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 9999,
            maxWidth: 260,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
