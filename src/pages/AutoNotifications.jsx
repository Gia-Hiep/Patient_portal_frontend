import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationRead,
} from "../services/notification";
import {
  getAutoNotificationSetting,
} from "../services/notificationSetting";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function AutoNotifications({ onReadChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const navigate = useNavigate();

  // =============================
  // LOAD DATA (ĐÚNG LOGIC)
  // =============================
  const load = useCallback(async () => {
    try {
      setLoading(true);

      // 🔔 1. LẤY SETTING TRƯỚC
      const setting = await getAutoNotificationSetting();
      const enabled = !!setting?.enabled;

      setDisabled(!enabled);

      // ⛔ user tắt auto notification
      if (!enabled) {
        setItems([]);
        if (onReadChange) onReadChange(0);
        return;
      }

      // 🔔 2. LẤY DANH SÁCH THÔNG BÁO
      const list = await getNotifications();
      const safeList = Array.isArray(list) ? list : [];

      setItems(safeList);

      if (onReadChange) {
        const unreadCount = safeList.filter(
          (n) => n.status === "UNREAD"
        ).length;
        onReadChange(unreadCount);
      }
    } catch (err) {
      console.error("Lỗi load notification:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [onReadChange]);

  useEffect(() => {
    load();
  }, [load]);

  // =============================
  // MARK AS READ
  // =============================
  const markAsRead = async (n) => {
    if (n.status === "READ") return;

    try {
      await markNotificationRead(n.id);

      const updated = items.map((item) =>
        item.id === n.id
          ? { ...item, status: "READ", readFlag: true }
          : item
      );

      setItems(updated);

      if (onReadChange) {
        const unreadCount = updated.filter(
          (x) => x.status === "UNREAD"
        ).length;
        onReadChange(unreadCount);
      }
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const isUnread = (n) => n.status === "UNREAD";

  if (loading) {
    return <p style={{ padding: 20 }}>Đang tải thông báo…</p>;
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      {/* NÚT QUAY VỀ */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          padding: "10px 18px",
          background: "#3a73f1",
          border: "none",
          borderRadius: 8,
          color: "white",
          cursor: "pointer",
          fontSize: 15,
        }}
      >
        ⬅ Quay về trang chủ
      </button>

      <h2 style={{ marginBottom: 16, marginTop: 60 }}>
        Thông báo tự động
      </h2>

      {/* USER TẮT AUTO NOTIFICATION */}
      {disabled && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            background: "#1b2236",
            border: "1px solid #2d3a57",
            color: "#9bb0d0",
          }}
        >
          🔕 Bạn đã tắt thông báo tự động trong phần cài đặt.
        </div>
      )}

      {/* KHÔNG CÓ THÔNG BÁO */}
      {!disabled && items.length === 0 && (
        <p style={{ color: "#aaa" }}>
          Bạn chưa có thông báo nào.
        </p>
      )}

      {/* LIST */}
      {!disabled &&
        items.map((n) => {
          const unread = isUnread(n);

          return (
            <div
              key={n.id}
              onClick={() => markAsRead(n)}
              style={{
                background: unread ? "#1c253a" : "#131a29",
                padding: "16px 20px",
                borderRadius: 10,
                marginBottom: 12,
                border: "1px solid #2d3a57",
                cursor: unread ? "pointer" : "default",
                position: "relative",
              }}
            >
              <h4 style={{ margin: "0 0 6px" }}>{n.title}</h4>

              <p style={{ margin: 0, opacity: 0.8 }}>{n.body}</p>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#9bb0d0",
                }}
              >
                {dayjs(n.createdAt).fromNow()}
              </div>

              {unread && (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "#ff4757",
                    padding: "2px 8px",
                    borderRadius: 8,
                    color: "white",
                    fontSize: 12,
                  }}
                >
                  Mới
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
}
