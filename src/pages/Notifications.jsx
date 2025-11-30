// import React, { useEffect, useState } from "react";
// import { fetchNotifications } from "../services/notifications";
// import { Link } from "react-router-dom";

// export default function Notifications() {
//   const [items, setItems] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let ignore = false;

//     (async () => {
//       try {
//         const data = await fetchNotifications();
//         if (ignore) return;

//         setItems(data || []);
//         setSelected((data && data[0]) || null);
//       } catch (err) {
//         setError(err.message || "Không tải được thông báo.");
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     })();

//     return () => (ignore = true);
//   }, []);

//   const formatDateTime = (isoStr) => {
//     if (!isoStr) return "";
//     const d = new Date(isoStr);
//     return d.toLocaleString("vi-VN");
//   };

//   if (loading) return <div className="page">Đang tải thông báo...</div>;
//   if (error) return <div className="page">Lỗi: {error}</div>;

//   return (
//     <div className="page" style={{ padding: "20px" }}>
//       {/* Nút trở về */}
//       <div style={{ marginBottom: "20px" }}>
//         <Link
//           to="/dashboard"
//           style={{
//             padding: "8px 14px",
//             backgroundColor: "#1976d2",
//             color: "white",
//             borderRadius: "6px",
//             textDecoration: "none",
//             fontWeight: "bold",
//           }}
//         >
//           ← Trở về trang chủ
//         </Link>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           gap: 16,
//           height: "75vh",
//         }}
//       >
//         {/* Cột trái */}
//         <div
//           style={{
//             width: "30%",
//             borderRight: "1px solid #555",
//             paddingRight: 10,
//             overflowY: "auto",
//           }}
//         >
//           <h2 style={{ marginTop: 0 }}>Thông báo</h2>

//           {items.length === 0 && <p>Hiện chưa có thông báo mới.</p>}

//           {items.map((n) => (
//             <div
//               key={n.id}
//               onClick={() => setSelected(n)}
//               style={{
//                 padding: "8px 10px",
//                 marginBottom: 6,
//                 borderRadius: 4,
//                 cursor: "pointer",
//                 backgroundColor:
//                   selected && selected.id === n.id ? "#e3f2fd" : "transparent",
//                 color: "white",
//               }}
//             >
//               <div style={{ fontWeight: 600 }}>{n.title}</div>
//               <div style={{ fontSize: 12, opacity: 0.8 }}>
//                 {formatDateTime(n.publishedAt)}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Cột phải */}
//         <div style={{ flex: 1, paddingLeft: 20, color: "white" }}>
//           {selected ? (
//             <>
//               <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
//               <div style={{ marginBottom: 10, opacity: 0.8 }}>
//                 {formatDateTime(selected.publishedAt)}
//               </div>

//               <div
//                 style={{
//                   background: "white",
//                   padding: 12,
//                   color: "#000",
//                   borderRadius: "6px",
//                   whiteSpace: "pre-line",
//                 }}
//               >
//                 {selected.content}
//               </div>
//             </>
//           ) : (
//             <p>Chọn một thông báo để xem chi tiết.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJson } from "../services/api";
import "../assets/styles/auth.css";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await getJson("/api/announcements");
        setItems(data || []);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Không tải được thông báo");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="auth-container notifications-page">
      {/* LAYOUT CHÍNH: trái = menu (1/3), phải = thông báo (2/3) */}
      <div className="notif-layout">
        {/* SIDEBAR MENU BÊN TRÁI */}
        <aside className="notif-side-nav">
          <div className="notif-side-title">Menu</div>

          <button
            className="notif-side-btn"
            onClick={() => navigate("/dashboard")}
          >
            Lịch khám
          </button>

          <button
            className="notif-side-btn"
            onClick={() => navigate("/dashboard")}
          >
            Kết quả
          </button>

          <button
            className="notif-side-btn notif-side-btn-active"
            onClick={() => navigate("/notifications")}
          >
            Thông báo
          </button>

          <button className="notif-side-btn" disabled>
            Tin nhắn
          </button>

          <button className="notif-side-btn" disabled>
            Viện phí
          </button>
        </aside>

        {/* CỘT PHẢI: Nút + tiêu đề + danh sách thông báo */}
        <main className="notif-main">
          {/* 🔹 Nút Trang chủ / Hồ sơ nằm trên phần thông báo */}
          <div className="notif-top-nav">
            <button
              className="notif-top-btn"
              onClick={() => navigate("/dashboard")}
            >
              Trang chủ
            </button>
            <button
              className="notif-top-btn"
              onClick={() => navigate("/profile")}
            >
              Hồ sơ
            </button>
          </div>

          <h1 className="notif-title">Thông báo</h1>

          {loading && <div>Đang tải thông báo...</div>}
          {err && <div className="alert">{err}</div>}

          {!loading && !err && items.length === 0 && (
            <div style={{ marginTop: 16 }}>Hiện chưa có thông báo mới.</div>
          )}

          {!loading && !err && items.length > 0 && (
            <div className="notif-card-list">
              {items.map((n) => (
                <div key={n.id} className="notif-card">
                  <div className="notif-card-title">{n.title}</div>
                  <div className="notif-card-sub">
                    {n.content || n.level || "Thông báo từ bệnh viện"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
