import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJson } from "../services/api";
import "../assets/styles/notifications.css";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI-only state (allowed): selection + search
  const [selectedId, setSelectedId] = useState(null);
  const [q, setQ] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await getJson("/api/announcements"); // MUST KEEP EXACTLY
        setItems(data || []);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Không tải được thông báo");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Optional: sort newest-first if a time field exists; otherwise keep server order
  const sortedItems = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];

    const getTime = (n) => {
      const v =
        n?.createdAt ??
        n?.createdTime ??
        n?.created_date ??
        n?.date ??
        n?.time ??
        n?.postedAt ??
        n?.updatedAt;

      if (!v) return null;
      const t = new Date(v).getTime();
      return Number.isFinite(t) ? t : null;
    };

    const hasAnyTime = arr.some((n) => getTime(n) != null);
    if (!hasAnyTime) return arr;

    arr.sort((a, b) => {
      const ta = getTime(a);
      const tb = getTime(b);
      if (ta == null && tb == null) return 0;
      if (ta == null) return 1;
      if (tb == null) return -1;
      return tb - ta;
    });

    return arr;
  }, [items]);

  const filteredItems = useMemo(() => {
    const kw = (q || "").trim().toLowerCase();
    if (!kw) return sortedItems;

    return sortedItems.filter((n) => {
      const t = (n?.title || "").toLowerCase();
      const c = (n?.content || "").toLowerCase();
      const p = (n?.postedBy || n?.author || n?.createdBy || "").toLowerCase();
      return t.includes(kw) || c.includes(kw) || p.includes(kw);
    });
  }, [sortedItems, q]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return (sortedItems || []).find((x) => String(x?.id) === String(selectedId)) || null;
  }, [sortedItems, selectedId]);

  const formatTime = (n) => {
    const v =
      n?.createdAt ??
      n?.createdTime ??
      n?.created_date ??
      n?.date ??
      n?.time ??
      n?.postedAt ??
      n?.updatedAt;

    if (!v) return "";
    const d = new Date(v);
    if (!Number.isFinite(d.getTime())) return String(v);

    // vi-VN formatting
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  };

  const postedBy =
    selectedItem?.postedBy ||
    selectedItem?.author ||
    selectedItem?.createdBy ||
    selectedItem?.sender ||
    "";

  return (
    <div className="notif-page">
      {/* Header */}
      <header className="notif-header">
        <div className="notif-header-left">
          <div className="notif-bell" aria-hidden="true">
            {/* simple bell icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="notif-header-title">Thông báo</h1>
        </div>

        {/* Do-not-change navigation functionality */}
        <nav className="notif-header-nav">
          <button className="notif-nav-btn" onClick={() => navigate("/dashboard")}>
            <span className="notif-nav-ico" aria-hidden="true">
              {/* home icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Trang chủ
          </button>

          <button className="notif-nav-btn" onClick={() => navigate("/profile")}>
            <span className="notif-nav-ico" aria-hidden="true">
              {/* user icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21a8 8 0 0 0-16 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            Hồ sơ
          </button>

          <div className="notif-avatar" title="BN">
            BN
          </div>
        </nav>
      </header>

      {/* Main split layout */}
      <div className="notif-body">
        {/* Left list */}
        <aside className="notif-left">
          <div className="notif-search">
            <span className="notif-search-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M21 21l-4.4-4.4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              className="notif-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
            />
          </div>

          <div className="notif-left-content">
            {loading && <div className="notif-state">Đang tải thông báo...</div>}

            {err && <div className="notif-alert">{err}</div>}

            {!loading && !err && items.length === 0 && (
              <div className="notif-empty-left">
                <div className="notif-empty-ico" aria-hidden="true">
                  {/* muted bell */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.8 19.8h4.4A2.2 2.2 0 0 1 12 22a2.2 2.2 0 0 1-2.2-2.2Z"
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
                <div className="notif-empty-title">Hiện chưa có thông báo mới.</div>
                <div className="notif-empty-sub">Các thông tin cập nhật từ bệnh viện sẽ được hiển thị tại đây.</div>
              </div>
            )}

            {!loading && !err && items.length > 0 && (
              <div className="notif-list">
                {filteredItems.map((n) => {
                  const isActive = String(n?.id) === String(selectedId);
                  return (
                    <button
                      type="button"
                      key={n.id}
                      className={`notif-item ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedId(n.id)}
                    >
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-sub">
                        {formatTime(n) || n.content || n.level || "Thông báo từ bệnh viện"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right detail */}
        <main className="notif-right">
          {!selectedItem ? (
            <div className="notif-placeholder">
              <div className="notif-illus" aria-hidden="true">
                <div className="notif-illus-circle" />
                <div className="notif-illus-mini" />
              </div>

              <div className="notif-placeholder-title">Chọn một thông báo để xem chi tiết.</div>
              <div className="notif-placeholder-sub">
                Nội dung chi tiết của thông báo sẽ xuất hiện ở khu vực này khi bạn chọn một mục từ danh sách bên trái.
              </div>

              <button className="notif-reload-btn" onClick={() => window.location.reload()}>
                <span className="notif-reload-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 12a9 9 0 1 1-2.64-6.36"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M21 3v6h-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Tải lại trang
              </button>
            </div>
          ) : (
            <div className="notif-detail">
              <div className="notif-detail-title">{selectedItem.title}</div>

              <div className="notif-detail-meta">
                {formatTime(selectedItem) && (
                  <div className="notif-detail-meta-item">
                    <span className="dot" />
                    <span>{formatTime(selectedItem)}</span>
                  </div>
                )}

                {postedBy && (
                  <div className="notif-detail-meta-item">
                    <span className="dot" />
                    <span>{postedBy}</span>
                  </div>
                )}
              </div>

              <div className="notif-detail-content">
                {selectedItem.content || selectedItem.message || selectedItem.detail || ""}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
