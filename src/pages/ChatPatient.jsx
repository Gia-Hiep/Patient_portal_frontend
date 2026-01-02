import React, { useEffect, useMemo, useRef, useState } from "react";
import { listMyDoctors, getPatientThread, sendPatientMessage } from "../services/chat";
import "../assets/styles/auth.css";

export default function ChatPatient() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const ds = await listMyDoctors();
        setDoctors(ds || []);
        if (ds?.length) setDoctorId(String(ds[0].id));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadThread = async (did) => {
    if (!did) return;
    const data = await getPatientThread(did);
    setMsgs(data || []);
    setTimeout(scrollBottom, 50);
  };

  // load lần đầu + mỗi khi đổi bác sĩ
  useEffect(() => { loadThread(doctorId); }, [doctorId]);

  // polling
  useEffect(() => {
    if (!doctorId) return;
    const t = setInterval(() => loadThread(doctorId), 2000);
    return () => clearInterval(t);
  }, [doctorId]);

  const send = async () => {
    const v = text.trim();
    if (!v || !doctorId) return;
    await sendPatientMessage(doctorId, v);
    setText("");
    await loadThread(doctorId);
  };

  return (
    <div className="auth-card" style={{ maxWidth: 980 }}>
      <h2 style={{ marginTop: 0 }}>Chat với bác sĩ</h2>

      {loading ? (
        <div>Đang tải…</div>
      ) : doctors.length === 0 ? (
        <div className="muted">Bạn chưa có bác sĩ để chat (chưa có lịch khám).</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div className="muted">Chọn bác sĩ:</div>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.fullName}</option>
              ))}
            </select>
          </div>

          <div style={{
            height: 420, overflowY: "auto",
            border: "1px solid #223", borderRadius: 14, padding: 12,
            background: "#0f1422"
          }}>
            {msgs.map(m => {
              const mine = m.senderRole === "PATIENT";
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
                      {mine ? "Bạn" : "Bác sĩ"}
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

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
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
  );
}
