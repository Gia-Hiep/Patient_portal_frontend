import React, { useEffect, useRef, useState } from "react";
import { listDoctorPatients, getDoctorThread, sendDoctorMessage } from "../services/chat";
import "../assets/styles/auth.css";

export default function ChatDoctor() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);
  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadPatients = async () => {
    const data = await listDoctorPatients(q);
    setPatients(data || []);
    if (!patientId && data?.length) setPatientId(data[0].id);
  };

  const loadThread = async (pid) => {
    if (!pid) return;
    const data = await getDoctorThread(pid);
    setMsgs(data || []);
    setTimeout(scrollBottom, 50);
  };

  useEffect(() => { loadPatients(); }, []);
  useEffect(() => { loadPatients(); }, [q]);
  useEffect(() => { loadThread(patientId); }, [patientId]);

  // polling thread
  useEffect(() => {
    if (!patientId) return;
    const t = setInterval(() => loadThread(patientId), 2000);
    return () => clearInterval(t);
  }, [patientId]);

  const send = async () => {
    const v = text.trim();
    if (!v || !patientId) return;
    await sendDoctorMessage(patientId, v);
    setText("");
    await loadThread(patientId);
  };

  return (
    <div className="auth-card" style={{ maxWidth: 1100 }}>
      <h2 style={{ marginTop: 0 }}>Bác sĩ – Tin nhắn bệnh nhân</h2>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
        {/* LEFT */}
        <div style={{ border: "1px solid #223", borderRadius: 14, padding: 12, background: "#0f1422" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm bệnh nhân…"
            style={{ width: "100%", marginBottom: 10 }}
          />
          <div style={{ maxHeight: 430, overflowY: "auto" }}>
            {patients.map(p => (
              <div
                key={p.id}
                onClick={() => setPatientId(p.id)}
                style={{
                  padding: "10px 10px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: p.id === patientId ? "#192033" : "transparent"
                }}
              >
                {p.fullName}
              </div>
            ))}
            {patients.length === 0 && <div className="muted">Chưa có cuộc trò chuyện.</div>}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ border: "1px solid #223", borderRadius: 14, padding: 12, background: "#0f1422" }}>
          {!patientId ? (
            <div className="muted">Chọn 1 bệnh nhân để xem chat.</div>
          ) : (
            <>
              <div style={{ height: 380, overflowY: "auto", padding: 6 }}>
                {msgs.map(m => {
                  const mine = m.senderRole === "DOCTOR";
                  return (
                    <div key={m.id} style={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                      marginBottom: 8
                    }}>
                      <div style={{
                        maxWidth: "70%",
                        padding: "10px 12px",
                        borderRadius: 14,
                        background: mine ? "#1f6feb" : "#192033"
                      }}>
                        <div style={{ fontSize: 13, opacity: .9 }}>
                          {mine ? "Bác sĩ" : "Bệnh nhân"}
                        </div>
                        <div style={{ marginTop: 4 }}>{m.content}</div>
                        <div style={{ fontSize: 11, opacity: .7, marginTop: 6 }}>
                          {new Date(m.sentAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập tin nhắn…"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === "Enter" ? send() : null}
                />
                <button className="chip-btn" onClick={send}>Gửi</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
