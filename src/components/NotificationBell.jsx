import React, { useEffect, useRef, useState } from "react";
import { fetchUnreadCount } from "../services/userNotifications";
import "../assets/styles/base.css";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [toast, setToast] = useState("");

  const toastTimerRef = useRef(null);

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
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setToast(""), 4000);
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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <>
      <div className="bell" title="Thông báo">
        <span className="bell__icon" aria-hidden="true">
          🔔
        </span>

        {count > 0 && (
          <span className="bell__badge" aria-label={`Có ${count} thông báo chưa đọc`}>
            {count}
          </span>
        )}
      </div>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <div className="toast__icon">🔔</div>
          <div className="toast__content">
            <div className="toast__title">Thông báo mới</div>
            <div className="toast__body">{toast}</div>
          </div>
        </div>
      )}
    </>
  );
}
