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

  if (loading) return <p className="process-empty">Đang tải…</p>;

  if (!stages.length)
    return (
      <div className="process-wrap">
        {/* Nút điều hướng */}
        <div className="process-nav">
          <Link to="/dashboard" className="process-btn">
            ⬅ Về trang chủ
          </Link>
          <Link to="/profile" className="process-btn">
            Hồ sơ cá nhân
          </Link>
        </div>

        <p className="process-empty">
          Hiện chưa có lịch khám hoặc trạng thái đang được cập nhật.
        </p>
      </div>
    );

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

  return (
    <div className="process-wrap">
      {/* === 2 NÚT ĐIỀU HƯỚNG === */}
      <div className="process-nav">
        <Link to="/dashboard" className="process-btn">
          ⬅ Về trang chủ
        </Link>
        <Link to="/profile" className="process-btn">
          Hồ sơ cá nhân
        </Link>
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
  );
}
