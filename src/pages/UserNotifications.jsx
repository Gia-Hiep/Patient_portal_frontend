import React, { useEffect, useState, useMemo } from "react";
import {
  fetchUserNotifications,
  markNotificationRead,
} from "../services/userNotifications";
import { Link } from "react-router-dom";
import "../assets/styles/userNotifications.css";

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const now = new Date();
  const t = new Date(isoStr);
  const diffMs = now - t;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}

export default function UserNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchUserNotifications();
      setItems(data || []);
      setError(null);
    } catch (e) {
      setError(e.message || "Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClick = async (n) => {
    if (n.status === "UNREAD") {
      try {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, status: "READ" } : x))
        );
      } catch (e) {
        console.error(e);
        // có thể hiện toast lỗi nhẹ
      }
    }
  };

  // Optional sorting for display only (safe): chỉ sort nếu mọi item đều có createdAt hợp lệ
  const displayItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return items;

    const allHaveCreatedAt = items.every((x) => !!x?.createdAt);
    if (!allHaveCreatedAt) return items;

    const copy = [...items];
    copy.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
      return tb - ta;
    });
    return copy;
  }, [items]);

  const unreadCount = useMemo(() => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, n) => acc + (n?.status === "UNREAD" ? 1 : 0), 0);
  }, [items]);

  if (loading) return <div className="un-page">Đang tải thông báo...</div>;
  if (error) return <div className="un-page">Lỗi: {error}</div>;

  return (
    <div className="un-page">
      <div className="un-shell">
        {/* Back link (route giữ nguyên /dashboard + text giữ nguyên) */}
        <div className="un-top">
          <Link to="/dashboard" className="un-back">
            ← Trở về trang chủ
          </Link>
        </div>

        {/* Header */}
        <header className="un-header">
          <div className="un-titleRow">
            <h1 className="un-title">
              Thông báo tự động
              {unreadCount > 0 && (
                <span className="un-count" aria-label={`${unreadCount}`}>
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
        </header>

        {/* Body */}
        {displayItems.length === 0 ? (
          <div className="un-emptyCard">
            <div className="un-emptyIcon" aria-hidden="true">
              {/* icon purely visual */}
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M4 4l16 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="un-emptyText">Bạn chưa có thông báo nào.</p>
          </div>
        ) : (
          <section className="un-list">
            {displayItems.map((n) => {
              const unread = n.status === "UNREAD";
              return (
                <article
                  key={n.id}
                  className={`un-item ${unread ? "is-unread" : "is-read"}`}
                  onClick={() => handleClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleClick(n);
                  }}
                >
                  {/* left accent */}
                  <div className="un-accent" aria-hidden="true" />

                  <div className="un-itemMain">
                    <div className="un-itemTop">
                      <div className="un-left">
                        <div className="un-icon" aria-hidden="true">
                          {/* small generic icon */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 2a7 7 0 0 1 7 7v4l2 3H3l2-3V9a7 7 0 0 1 7-7Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.5 19a2.5 2.5 0 0 0 5 0"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div className="un-text">
                          <div className="un-titleLine">
                            <div className="un-itemTitle">{n.title}</div>

                            {unread && (
                              <span className="un-newPill">• Mới</span>
                            )}
                          </div>

                          <div className="un-itemBody">{n.body}</div>
                        </div>
                      </div>

                      <div className="un-time">{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
