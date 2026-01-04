import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listDoctorPatients,
  getDoctorThread,
  sendDoctorMessage,
} from "../services/chat";
import "../assets/styles/chatDoctor.css";

function getInitials(name) {
  const s = (name || "").trim();
  if (!s) return "BN";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "B";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "N";
  return (a + b).toUpperCase();
}

function MessageBubble({ mine, content, sentAt }) {
  return (
    <div className={`cd-msgRow ${mine ? "mine" : "theirs"}`}>
      <div className={`cd-bubble ${mine ? "mine" : "theirs"}`}>
        <div className="cd-bubbleMeta">
          <span className="cd-bubbleSender">{mine ? "Bác sĩ" : "Bệnh nhân"}</span>
          <span className="cd-bubbleTime">
            {new Date(sentAt).toLocaleString("vi-VN")}
          </span>
        </div>
        <div className="cd-bubbleText">{content}</div>
      </div>
    </div>
  );
}

export default function ChatDoctor() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);
  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

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

  useEffect(() => {
    loadPatients();
  }, []);
  useEffect(() => {
    loadPatients();
  }, [q]);
  useEffect(() => {
    loadThread(patientId);
  }, [patientId]);

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

  const selectedPatient = patients.find((p) => p.id === patientId) || null;

  return (
    <div className="cd-page auth-card">
      {/* Top header: title + Home button */}
      <div className="cd-topbar">
        <h2 className="cd-title">Bác sĩ – Tin nhắn bệnh nhân</h2>

        <button
          type="button"
          className="cd-homeBtn"
          onClick={() => navigate("/dashboard")}
          title="Quay lại Trang chủ"
        >
          ⟵ Trang chủ
        </button>
      </div>

      <div className="cd-layout">
        {/* LEFT */}
        <aside className="cd-left">
          <div className="cd-searchWrap">
            <span className="cd-searchIcon" aria-hidden="true">
              🔎
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm bệnh nhân…"
              className="cd-searchInput"
            />
          </div>

          <div className="cd-list">
            {patients.map((p) => {
              const active = p.id === patientId;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPatientId(p.id)}
                  className={`cd-item ${active ? "active" : ""}`}
                >
                  <div className="cd-avatar" aria-hidden="true">
                    {getInitials(p.fullName)}
                  </div>
                  <div className="cd-itemMain">
                    <div className="cd-itemName">{p.fullName}</div>
                  </div>
                </button>
              );
            })}

            {patients.length === 0 && (
              <div className="cd-emptyLeft muted">Chưa có cuộc trò chuyện.</div>
            )}
          </div>
        </aside>

        {/* RIGHT */}
        <section className="cd-right">
          {!patientId ? (
            <div className="cd-emptyRight">
              <div className="cd-emptyIcon" aria-hidden="true">
                💬
              </div>
              <div className="cd-emptyTitle">Chọn 1 bệnh nhân để xem chat.</div>
            </div>
          ) : (
            <>
              <div className="cd-rightHeader">
                <div className="cd-rightUser">
                  <div className="cd-avatar lg" aria-hidden="true">
                    {getInitials(selectedPatient?.fullName)}
                  </div>
                  <div className="cd-rightUserText">
                    <div className="cd-rightName">
                      {selectedPatient?.fullName || ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="cd-thread" role="log" aria-live="polite">
                <div className="cd-threadInner">
                  {msgs.map((m) => {
                    const mine = m.senderRole === "DOCTOR";
                    return (
                      <MessageBubble
                        key={m.id}
                        mine={mine}
                        content={m.content}
                        sentAt={m.sentAt}
                      />
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="cd-composer">
                <div className="cd-composerLeft">
                  <button type="button" className="cd-iconBtn" title="Đính kèm">
                    📎
                  </button>
                </div>

                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập tin nhắn…"
                  className="cd-input"
                  onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
                />

                <button className="cd-sendBtn" onClick={send}>
                  Gửi
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
