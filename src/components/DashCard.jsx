import React from "react";
import "../assets/styles/dashCard.css";

export default function DashCard({ title, value, sub, to, onClick }) {
  const Wrapper = ({ children }) =>
    to ? (
      <a href={to} className="dc-link">
        {children}
      </a>
    ) : (
      <div
        onClick={onClick}
        className="dc-link"
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        {children}
      </div>
    );

  return (
    <Wrapper>
      <div className="dc-card">
        {/* icon tile (purely presentational) */}
        <div className="dc-iconTile" aria-hidden="true" />

        <div className="dc-content">
          <div className="dc-title">{title}</div>
          <div className="dc-value">{value}</div>
          {sub && <div className="dc-sub">{sub}</div>}
        </div>
      </div>
    </Wrapper>
  );
}
