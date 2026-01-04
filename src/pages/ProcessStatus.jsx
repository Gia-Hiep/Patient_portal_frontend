import React, { useEffect, useRef, useState } from "react";
import { getProcess } from "../services/process";
import { Link } from "react-router-dom";
import "../assets/styles/process.css";

export default function ProcessStatus() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  const load = async () => {
    try {
      const r = await getProcess();
      const list = r?.stages || r?.data?.stages || [];
      setStages(list);

      if (list.length && list.every((s) => s.status === "DONE")) {
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

  const getDotClass = (status) => {
    if (status === "DONE") return "ps-dot ps-dot-done";
    if (status === "IN_PROGRESS") return "ps-dot ps-dot-progress";
    return "ps-dot ps-dot-idle";
  };

  const currentStage = stages.find((s) => s.status === "IN_PROGRESS");
  const currentLabel = currentStage?.stageName ? currentStage.stageName : "";

  if (loading) {
    return <p className="process-empty">Đang tải trạng thái quy trình khám…</p>;
  }

  if (!stages.length) {
    return (
      <div className="ps-page">
        <div className="ps-layout">
          {/* MENU */}
          <aside className="ps-sidebar">
            <div className="ps-brand">
              <div className="ps-logo" aria-hidden="true">
                +
              </div>
              <div>
                <div className="ps-brandTitle">Cổng Bệnh Nhân</div>
                <div className="ps-brandSub">Bệnh viện Đa Khoa</div>
              </div>
            </div>

            <nav className="ps-nav">
              <Link to="/records" className="ps-navItem">
                Lịch khám
              </Link>
              <Link to="/lab-results" className="ps-navItem">
                Kết quả
              </Link>
              <Link to="/autonotifications" className="ps-navItem">
                Thông báo
              </Link>
              <Link to="/chat" className="ps-navItem">
                Tin nhắn
              </Link>
              <Link to="/billing" className="ps-navItem">
                Viện phí
              </Link>

              <div className="ps-navDivider" />

              <Link to="/dashboard" className="ps-navItem">
                ⬅ Trang chủ
              </Link>
              <Link to="/profile" className="ps-navItem">
                Hồ sơ cá nhân
              </Link>
            </nav>
          </aside>

          {/* CONTENT */}
          <main className="ps-content">
            <div className="ps-topbar">
              <Link to="/dashboard" className="ps-topLink">
                ⬅ Trang chủ
              </Link>
              <Link to="/profile" className="ps-topLink ps-topLink-ghost">
                Hồ sơ cá nhân
              </Link>
            </div>

            <div className="ps-header">
              <h1 className="ps-title">Trạng thái quy trình khám</h1>
              <p className="ps-subtitle">
                Theo dõi tiến trình khám chữa bệnh của bạn hôm nay
              </p>
            </div>

            <section className="ps-card">
              <div className="ps-cardHeader">
                <div className="ps-current">
                  <span className="ps-currentDot" aria-hidden="true" />
                  <span>Trạng thái hiện tại:&nbsp;</span>
                  <b>{currentLabel || "Đang khám"}</b>
                </div>
                <div className="ps-id">ID: --</div>
              </div>

              <div className="ps-emptyInner">
                Hiện chưa có lịch khám hoặc trạng thái đang được cập nhật.
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-page">
      <div className="ps-layout">
        {/* MENU */}
        <aside className="ps-sidebar">
          <div className="ps-brand">
            <div className="ps-logo" aria-hidden="true">
              +
            </div>
            <div>
              <div className="ps-brandTitle">Cổng Bệnh Nhân</div>
              <div className="ps-brandSub">Bệnh viện Đa Khoa</div>
            </div>
          </div>

          <nav className="ps-nav">
            <Link to="/dashboard" className="ps-navItem">
              Trang chủ
            </Link>
            <Link to="/profile" className="ps-navItem">
              Hồ sơ cá nhân
            </Link>

            <Link to="/process" className="ps-navItem ps-navItem-active">
              Trạng thái khám
            </Link>

            <Link to="/lab-results" className="ps-navItem">
              Kết quả
            </Link>
            <Link to="/autonotifications" className="ps-navItem">
              Thông báo
            </Link>
            <Link to="/chat" className="ps-navItem">
              Tin nhắn
            </Link>
            <Link to="/billing" className="ps-navItem">
              Viện phí
            </Link>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="ps-content">
          <div className="ps-topbar">
            <Link to="/dashboard" className="ps-topLink">
              ⬅ Trang chủ
            </Link>

            <div className="ps-topRight">
              <Link to="/profile" className="ps-topBtn">
                Hồ sơ cá nhân
              </Link>
            </div>
          </div>

          <div className="ps-header">
            <h1 className="ps-title">Trạng thái quy trình khám</h1>
            <p className="ps-subtitle">
              Theo dõi tiến trình khám chữa bệnh của bạn hôm nay
            </p>
          </div>

          <section className="ps-card">
            <div className="ps-cardHeader">
              <div className="ps-current">
                <span className="ps-currentDot" aria-hidden="true" />
                <span>Trạng thái hiện tại:&nbsp;</span>
                <b>{currentLabel || "Đang khám"}</b>
              </div>
              <div className="ps-id">ID: --</div>
            </div>

            <div className="ps-timeline">
              {stages.map((s, idx) => {
                const isActive = s.status === "IN_PROGRESS";
                const isDone = s.status === "DONE";

                return (
                  <div
                    key={s.stageOrder}
                    className={`ps-step ${
                      isActive ? "ps-step-active" : isDone ? "ps-step-done" : ""
                    }`}
                  >
                    <div className="ps-stepRail" aria-hidden="true">
                      <div className={getDotClass(s.status)} />
                      {idx !== stages.length - 1 && <div className="ps-line" />}
                    </div>

                    <div className="ps-stepBody">
                      <div
                        className={`ps-stepCard ${
                          isActive ? "ps-stepCard-active" : ""
                        }`}
                      >
                        <div className="ps-stepTop">
                          <div className="ps-stepTitle">
                            {s.stageOrder}. {s.stageName}
                          </div>

                          <div
                            className={`ps-badge ${getStatusClass(s.status)}`}
                          >
                            {getStatusLabel(s, idx)}
                          </div>
                        </div>

                        {isActive ? (
                          <div className="ps-stepDesc">
                            Bệnh nhân đang được bác sĩ thăm khám và kiểm tra các
                            dấu hiệu sinh tồn. Vui lòng đợi kết quả.
                          </div>
                        ) : (
                          <div className="ps-stepDesc ps-stepDesc-muted">
                            &nbsp;
                          </div>
                        )}

                        {isActive ? (
                          <div className="ps-miniGrid">
                            <div className="ps-miniCard">
                              <div className="ps-miniLabel">PHÒNG KHÁM</div>
                              <div className="ps-miniValue">Phòng 204 - Tầng 2</div>
                            </div>
                            <div className="ps-miniCard">
                              <div className="ps-miniLabel">BÁC SĨ PHỤ TRÁCH</div>
                              <div className="ps-miniValue">
                                BS.CKI Nguyễn Văn An
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {isActive ? (
                          <div className="ps-stepFooter">
                            <a className="ps-detailLink" href="#!">
                              Xem chi tiết phiếu khám →
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
