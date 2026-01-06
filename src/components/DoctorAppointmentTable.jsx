import React, { useMemo, useState } from "react";
import "../assets/styles/doctorAppointments.css";

export default function DoctorAppointmentTable({ appointments }) {
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  // ✅ Allowed: UI-only filter state
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL | WAITING | COMPLETED | LAB | CANCELLED

  // ===== SORT APPOINTMENTS BY TIME (KEEP behavior) =====
  const sortedAppointments = useMemo(() => {
    const list = [...appointments];

    list.sort((a, b) => {
      const t1 = new Date(a.scheduledAt).getTime();
      const t2 = new Date(b.scheduledAt).getTime();

      return sortOrder === "asc" ? t1 - t2 : t2 - t1;
    });

    return list;
  }, [appointments, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // ===== FILTER (UI-only, derived from appointments) =====
  const filteredAppointments = useMemo(() => {
    if (filterStatus === "ALL") return sortedAppointments;

    return sortedAppointments.filter((a) => {
      const raw = (a?.status || "").toUpperCase();

      // waiting mapping (same as mapStatus)
      const isWaiting = raw === "REQUESTED" || raw === "CONFIRMED";
      const isCompleted = raw === "COMPLETED";
      const isCancelled = raw === "CANCELLED" || raw === "NO_SHOW";

      // ✅ "Đang xét nghiệm" ONLY if backend sends known value.
      // If not present, this filter will simply match nothing.
      const isLab = raw === "LAB_PENDING" || raw === "IN_LAB";

      if (filterStatus === "WAITING") return isWaiting;
      if (filterStatus === "COMPLETED") return isCompleted;
      if (filterStatus === "CANCELLED") return isCancelled;
      if (filterStatus === "LAB") return isLab;

      return true;
    });
  }, [sortedAppointments, filterStatus]);

  const total = appointments?.length || 0;
  const shown = filteredAppointments.length;

  // ===== Empty state (required) =====
  if (!filteredAppointments.length) {
    return (
      <section className="da-card">
        <header className="da-head">
          <div className="da-head-left">
            <div className="da-title">Lịch khám hôm nay</div>
            <div className="da-subtitle"></div>
          </div>

          <div className="da-head-right">
            <div className="da-filter">
              <span className="da-filter-icon" aria-hidden="true">
                ≡
              </span>
              <span className="da-filter-label">Trạng thái:</span>
              <select
                className="da-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                <option value="WAITING">Đang chờ</option>
                <option value="LAB">Đang xét nghiệm</option>
                <option value="COMPLETED">Đã khám</option>
                <option value="CANCELLED">Đã huỷ</option>
              </select>
            </div>

            <button type="button" className="da-icon-btn" aria-label="Tùy chọn">
              ≡
            </button>
          </div>
        </header>

        <div className="da-empty">
          <div className="da-empty-text">Không có lịch khám hôm nay.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="da-card">
      <header className="da-head">
        <div className="da-head-left">
          <div className="da-title">Lịch khám hôm nay</div>
          <div className="da-subtitle"></div>
        </div>

        <div className="da-head-right">
          <div className="da-filter">
            <span className="da-filter-icon" aria-hidden="true">
              ≡
            </span>
            <span className="da-filter-label">Trạng thái:</span>
            <select
              className="da-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="WAITING">Đang chờ</option>
              <option value="LAB">Đang xét nghiệm</option>
              <option value="COMPLETED">Đã khám</option>
              <option value="CANCELLED">Đã huỷ</option>
            </select>
          </div>

          <button type="button" className="da-icon-btn" aria-label="Tùy chọn">
            ≡
          </button>
        </div>
      </header>

      <div className="da-table-wrap">
        <table className="da-table">
          <thead>
            <tr>
              <th className="da-th da-th-patient">Bệnh nhân</th>

              {/* SORTABLE HEADER (KEEP toggleSort + indicator) */}
              <th className="da-th da-th-time" onClick={toggleSort}>
                <span className="da-sort-head">
                  Ngày / giờ khám
                  <span className="da-sort-ind">
                    {sortOrder === "asc" ? "▲" : "▼"}
                  </span>
                </span>
              </th>

              <th className="da-th da-th-status">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.map((a) => (
              <tr className="da-tr" key={`${a.patientName}-${a.scheduledAt}`}>
                <td className="da-td da-td-patient">
                  <div className="da-patient">
                    <div className="da-avatar" aria-hidden="true">
                      {makeInitials(a.patientName)}
                    </div>
                    <div className="da-patient-info">
                      <div className="da-patient-name" title={a.patientName}>
                        {a.patientName}
                      </div>
                      <div className="da-patient-meta">
                        ID: {a.patientId || a.patientCode || "—"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="da-td da-td-time">
                  <div className="da-time">
                    <span className="da-time-icon" aria-hidden="true">
                      🕒
                    </span>
                    <span>
                      {a.scheduledAt
                        ? new Date(a.scheduledAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                </td>

                <td className="da-td da-td-status">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer like design (UI-only) */}
      <footer className="da-footer">
        <div className="da-footer-left">
          Hiển thị 1 đến {Math.min(shown, 5)} trong tổng số {total} bệnh nhân
        </div>

        <div className="da-pagination" aria-label="Phân trang">
          <button type="button" className="da-page-btn" aria-label="Trang trước">
            ‹
          </button>
          <button type="button" className="da-page-num active">
            1
          </button>
          <button type="button" className="da-page-num">
            2
          </button>
          <button type="button" className="da-page-num">
            3
          </button>
          <button type="button" className="da-page-btn" aria-label="Trang sau">
            ›
          </button>
        </div>
      </footer>

      {/* KPI cards like design (derived from appointments) */}
      <div className="da-kpis">
        <div className="da-kpi">
          <div className="da-kpi-icon wait" aria-hidden="true">
            ⏳
          </div>
          <div className="da-kpi-body">
            <div className="da-kpi-label">ĐANG CHỜ</div>
            <div className="da-kpi-value">{countWaiting(appointments)}</div>
          </div>
        </div>

        <div className="da-kpi">
          <div className="da-kpi-icon lab" aria-hidden="true">
            🧪
          </div>
          <div className="da-kpi-body">
            <div className="da-kpi-label">XÉT NGHIỆM</div>
            <div className="da-kpi-value">{countLab(appointments)}</div>
          </div>
        </div>

        <div className="da-kpi">
          <div className="da-kpi-icon done" aria-hidden="true">
            ✓
          </div>
          <div className="da-kpi-body">
            <div className="da-kpi-label">HOÀN THÀNH</div>
            <div className="da-kpi-value">{countCompleted(appointments)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== STATUS MAP (KEEP existing outputs) ===== */
function mapStatus(status) {
  switch (status) {
    case "REQUESTED":
    case "CONFIRMED":
      return "Đang chờ";
    case "COMPLETED":
      return "Đã khám";
    case "CANCELLED":
    case "NO_SHOW":
      return "Đã huỷ";
    case "LAB_PENDING":
      return "Đang xét nghiệm";
    default:
      return status || "";
  }
}

/* ===== Presentational badge (UI-only) ===== */
function StatusBadge({ status }) {
  const raw = (status || "").toUpperCase();
  const label = mapStatus(status);

  // keep mapping outputs; only special-case style for known lab states
  const isWaiting = raw === "REQUESTED" || raw === "CONFIRMED";
  const isCompleted = raw === "COMPLETED";
  const isCancelled = raw === "CANCELLED" || raw === "NO_SHOW";
  const isLab = raw === "LAB_PENDING" || raw === "IN_LAB";

  let cls = "da-badge";
  if (isWaiting) cls += " wait";
  else if (isLab) cls += " lab";
  else if (isCompleted) cls += " done";
  else if (isCancelled) cls += " cancel";
  else cls += " neutral";

  // label: if lab known -> show “Đang xét nghiệm”, else keep mapStatus output or raw
  const finalLabel = isLab ? "Đang xét nghiệm" : label;

  return <span className={cls}>{finalLabel}</span>;
}

/* ===== Helpers (UI-only) ===== */
function makeInitials(name) {
  const s = (name || "").trim();
  if (!s) return "BN";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase() || "BN";
}

function countWaiting(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((a) => {
    const raw = (a?.status || "").toUpperCase();
    return raw === "REQUESTED" || raw === "CONFIRMED";
  }).length;
}

function countCompleted(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((a) => (a?.status || "").toUpperCase() === "COMPLETED")
    .length;
}

function countLab(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((a) => {
    const raw = (a?.status || "").toUpperCase();
    return raw === "LAB_PENDING" || raw === "IN_LAB";
  }).length;
}
