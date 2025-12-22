import React, { useMemo, useState } from "react";

export default function DoctorAppointmentTable({ appointments }) {
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  // ===== SORT APPOINTMENTS BY TIME =====
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

  return (
    <table
      width="100%"
      style={{
        borderCollapse: "collapse",
        tableLayout: "fixed",
      }}
    >
      <thead>
        <tr>
          <th style={thPatient}>Bệnh nhân</th>

          {/* ===== SORTABLE HEADER ===== */}
          <th style={thTime} onClick={toggleSort}>
            Ngày / giờ khám{" "}
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          </th>

          <th style={thStatus}>Trạng thái</th>
        </tr>
      </thead>

      <tbody>
        {sortedAppointments.map((a) => (
          <tr key={`${a.patientName}-${a.scheduledAt}`}>
            <td style={tdPatient}>{a.patientName}</td>
            <td style={tdTime}>
              {a.scheduledAt
                ? new Date(a.scheduledAt).toLocaleString()
                : ""}
            </td>
            <td style={tdStatus}>{mapStatus(a.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ===== COLUMN STYLES ===== */
const thPatient = {
  width: "45%",
  textAlign: "left",
  padding: "10px 8px",
  fontWeight: 600,
};

const thTime = {
  width: "40%",
  textAlign: "left",
  padding: "10px 8px",
  fontWeight: 600,
  cursor: "pointer", // 👈 cho biết click được
  userSelect: "none",
};

const thStatus = {
  width: "25%",
  textAlign: "center",
  padding: "10px 8px",
  fontWeight: 600,
};

const tdPatient = {
  textAlign: "left",
  padding: "10px 8px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tdTime = {
  textAlign: "left",
  padding: "10px 8px",
};

const tdStatus = {
  textAlign: "center",
  padding: "10px 8px",
};

/* ===== STATUS MAP ===== */
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
    default:
      return status || "";
  }
}
