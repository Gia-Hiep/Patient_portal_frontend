import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listMyDoctors,
  getPatientThread,
  sendPatientMessage,
} from "../services/chat";
import "../assets/styles/chatPatient.css";

export default function ChatPatient() {
  const nav = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

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
  useEffect(() => {
    loadThread(doctorId);
  }, [doctorId]);

  // polling
  useEffect(() => {
    if (!doctorId) return;
    const t = setInterval(() => loadThread(doctorId), 8000);
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
    <div className="chatp-page">
      <div className="auth-card chatp-card">
        <div className="chatp-pageHead">
          <div className="chatp-titleWrap">
            <div className="chatp-topActions">
              <button
                className="chatp-backBtn"
                type="button"
                onClick={() => nav("/dashboard")}
              >
                ← Quay lại Dashboard
              </button>
            </div>

            <h2 className="chatp-title">Chat với bác sĩ</h2>
          </div>

          {!loading && doctors.length > 0 && (
            <div className="chatp-doctorPick">
              <div className="chatp-doctorLabel muted">Chọn bác sĩ:</div>
              <div className="chatp-selectWrap">
                <select
                  className="chatp-select"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
                <span className="chatp-selectChevron" aria-hidden="true">
                  ▾
                </span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="chatp-state">Đang tải…</div>
        ) : doctors.length === 0 ? (
          <div className="chatp-empty">
            <div className="chatp-emptyIcon" aria-hidden="true">
              <div className="chatp-emptyIconInner" />
            </div>
            <div className="muted chatp-emptyText">
              Bạn chưa có bác sĩ để chat (chưa có lịch khám).
            </div>
          </div>
        ) : (
          <div className="chatp-shell">
            <div className="chatp-messages" role="log" aria-live="polite">
              {msgs.map((m) => {
                const mine = m.senderRole === "PATIENT";
                return (
                  <div
                    key={m.id}
                    className={`chatp-row ${mine ? "is-mine" : "is-their"}`}
                  >
                    {!mine && (
                      <div className="chatp-avatar" aria-hidden="true">
                        <span className="chatp-avatarInner">BS</span>
                      </div>
                    )}

                    <div className={`chatp-bubble ${mine ? "mine" : "their"}`}>
                      <div className="chatp-bubbleMeta">
                        <span className="chatp-sender">
                          {mine ? "Bạn" : "Bác sĩ"}
                        </span>
                        <span className="chatp-time">
                          {new Date(m.sentAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <div className="chatp-content">{m.content}</div>
                    </div>

                    {mine && (
                      <div className="chatp-avatar mine" aria-hidden="true">
                        <span className="chatp-avatarInner">Bạn</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="chatp-composer">
              <input
                className="chatp-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn…"
                onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
              />
              <button className="chatp-sendBtn chip-btn" onClick={send}>
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
