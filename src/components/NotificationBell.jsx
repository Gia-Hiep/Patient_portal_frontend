// src/components/NotificationBell.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ count }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/autonotifications")}
      style={{
        position: "fixed",
        top: 18,
        right: 120,
        cursor: "pointer",
        color: "white",
        fontSize: 22,
        display: "flex",
        alignItems: "center",
        gap: 6,
        zIndex: 2000,
      }}
    >
      🔔

      {count > 0 && (
        <span
          style={{
            background: "#ff3b3b",
            color: "white",
            borderRadius: "50%",
            padding: "2px 7px",
            fontSize: 12,
            fontWeight: 700,
            animation: "pulse 1.3s infinite",
          }}
        >
          {count}
        </span>
      )}

      <style>
        {`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        `}
      </style>
    </div>
  );
}
