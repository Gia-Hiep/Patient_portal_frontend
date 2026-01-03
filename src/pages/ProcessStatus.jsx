import React, { useEffect, useRef, useState } from "react";
import { getProcess } from "../services/process";
import { Link } from "react-router-dom";

export default function ProcessStatus() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);


  const load = async () => {
    try {
      const r = await getProcess();
      const list = r?.stages || r?.data?.stages || [];
      setStages(list);

      if (list.length && list.every(s => s.status === "DONE")) {
        stopPolling();
      }
    } catch (err) {
      console.error("Lỗi load process:", err);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(load, 5000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };


  useEffect(() => {
    load();
    startPolling();
    return () => stopPolling();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "DONE":
        return "status-done";
      case "IN_PROGRESS":
        return "status-waiting";
      default:
        return "status-not-started";
    }
  };

  const getStatusLabel = (stage, index) => {
    const isLastStage = index === stages.length - 1;

    if (stage.status === "DONE") return "Hoàn thành";

    if (stage.status === "IN_PROGRESS") {
      // 🔥 stage cuối đang IN_PROGRESS → HIỂN THỊ HOÀN TẤT
      if (isLastStage) return "Hoàn tất";
      return "Đang xử lý";
    }

    return "Chưa khám";
  };


  if (loading) {
    return (
      <p className="process-empty">
        Đang tải trạng thái quy trình khám…
      </p>
    );
  }

  if (!stages.length) {
    return (
      <div className="process-wrap">
        <div className="process-layout">
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

          <div style={{ flex: 1 }}>
            <p className="process-empty">
              Hiện chưa có lịch khám hoặc trạng thái đang được cập nhật.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="process-wrap">
      <div className="process-layout">

        {/* MENU */}
        <div className="process-menu">

          <Link to="/lab-results" className="menu-btn">Kết quả</Link>
          <Link to="/autonotifications" className="menu-btn">Thông báo</Link>
          <Link to="/chat" className="menu-btn">Tin nhắn</Link>
          <Link to="/billing" className="menu-btn">Viện phí</Link>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <Link to="/dashboard" className="process-btn-top">
              ⬅ Trang chủ
            </Link>
            <Link to="/profile" className="process-btn-top">
              Hồ sơ cá nhân
            </Link>
          </div>

          <div className="process-title">
            Trạng thái quy trình khám
          </div>

          {stages.map((s, idx) => (
            <div key={s.stageOrder} className="process-card">
              <div className="process-left">
                {s.stageOrder}. {s.stageName}
              </div>

              <div
                className={`process-status ${getStatusClass(s.status)}`}
              >
                {getStatusLabel(s, idx)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
