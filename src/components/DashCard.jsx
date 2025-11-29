import React from "react";

export default function DashCard({ title, value, sub, to, onClick }) {
  const Wrapper = ({ children }) =>
    to ? (
      <a href={to} style={{ textDecoration: "none" }}>
        {children}
      </a>
    ) : (
      <div onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
        {children}
      </div>
    );

  return (
    <Wrapper>
      <div
        style={{
          background: "#141a2b",
          borderRadius: 18,
          padding: 18,
          minWidth: 220,
          border: "1px solid #223",
          boxShadow: "0 10px 24px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ opacity: 0.85, fontSize: 13, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{value}</div>
        {sub && <div style={{ opacity: 0.7, fontSize: 12 }}>{sub}</div>}
      </div>
    </Wrapper>
  );
}
