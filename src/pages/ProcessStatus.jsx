import React, { useEffect, useState } from "react";
import { getProcess } from "../services/process";
import { Link } from "react-router-dom";

export default function ProcessStatus() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await getProcess();
      const list = r.stages || r.data?.stages || [];
      setStages(list);
    } catch (err) {
      console.error("Lỗi load process:", err);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "DONE":
        return "status-done";
      case "WAITING":
        return "status-waiting";
      default:
        return "status-not-started";
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case "DONE":
        return "Hoàn thành";
      case "WAITING":
        return "Đang chờ";
      default:
        return "Chưa khám";
    }
  };

  // -------------------- UI KHI CHƯA CÓ DỮ LIỆU --------------------
  if (loading) return <p className="process-empty">Đang tải…</p>;

  if (!stages.length)
    return (
      <div className="process-wrap">
        <div className="process-layout">
          {/* MENU BÊN TRÁI */}
          <div className="process-menu">
            <Link to="/records" className="menu-btn">Lịch khám</Link>
            <Link to="/lab-results" className="menu-btn">Kết quả</Link>
            <Link to="/autonotifications" className="menu-btn">Thông báo</Link>
            <Link to="/chat" className="menu-btn">Tin nhắn</Link>
            <Link to="/billing" className="menu-btn">Viện phí</Link>

            <hr style={{ opacity: 0.2 }} />

            <Link to="/dashboard" className="menu-btn">⬅ Trang chủ</Link>
            <Link to="/profile" className="menu-btn">Hồ sơ cá nhân</Link>
          </div>

          {/* NỘI DUNG */}
          <div style={{ flex: 1 }}>
            <p className="process-empty">
              Hiện chưa có lịch khám hoặc trạng thái đang được cập nhật.
            </p>
          </div>
        </div>
      </div>
    );

  // -------------------- UI KHI CÓ DỮ LIỆU --------------------
 return (
  <div className="process-wrap">

    <div className="process-layout">

      {/* === MENU BÊN TRÁI === */}
      <div className="process-menu">
        <Link to="/records" className="menu-btn">Lịch khám</Link>
        <Link to="/lab-results" className="menu-btn">Kết quả</Link>
        <Link to="/autonotifications" className="menu-btn">Thông báo</Link>
        <Link to="/chat" className="menu-btn">Tin nhắn</Link>
        <Link to="/billing" className="menu-btn">Viện phí</Link>

        <hr style={{ opacity: 0.2 }} />

      
      </div>

      {/* === NỘI DUNG CHÍNH === */}
      <div style={{ flex: 1 }}>

        {/* ⭐ 2 NÚT NẰM TRÊN TIÊU ĐỀ ⭐ */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <Link to="/dashboard" className="process-btn-top">⬅ Trang chủ</Link>
          <Link to="/profile" className="process-btn-top">Hồ sơ cá nhân</Link>
        </div>

        <div className="process-title">Trạng thái quy trình khám</div>
        <div className="process-desc">
          Danh sách các phòng khám theo trình tự lịch khám của bạn.
        </div>

        {stages.map((s) => (
          <div key={s.stageOrder} className="process-card">
            <div className="process-left">
              {s.stageOrder}. {s.stageName}
            </div>

            <div className={`process-status ${getStatusClass(s.status)}`}>
              {getStatusLabel(s.status)}
            </div>
          </div>
        ))}

      </div>
    </div>
  </div>
);

}
