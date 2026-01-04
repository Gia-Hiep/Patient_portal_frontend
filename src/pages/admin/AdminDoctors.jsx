import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AppHeader from "../../components/Header";
import {
  deleteAdminDoctor,
  getAdminDoctors,
  updateAdminDoctor,
  createAdminDoctor,
} from "../../services/adminDoctors";

/* ================= UI COMPONENTS ================= */

function Badge({ children }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid #2a3555",
        fontSize: 12,
        background: "#0f1422",
      }}
    >
      {children}
    </span>
  );
}

function Modal({ title, onClose, children, width = 720 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: width,
          background: "#0b1020",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
      <div
  style={{
    fontWeight: 700,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  }}
>
  {title}
</div>

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 13, opacity: 0.9 }}>{label}</div>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            padding: 10,
            borderRadius: 12,
            border: "1px solid #223",
            background: "#0f1422",
            color: "#fff",
          }}
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: 10,
            borderRadius: 12,
            border: "1px solid #223",
            background: "#0f1422",
            color: "#fff",
          }}
        />
      )}
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export default function AdminDoctors() {
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [includeDisabled, setIncludeDisabled] = useState(false);

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editModel, setEditModel] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ===== CREATE DOCTOR ===== */
  const [createOpen, setCreateOpen] = useState(false);
  const [createModel, setCreateModel] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    specialty: "",
    department: "",
    licenseNo: "",
    workingSchedule: "",
  });

  useEffect(() => {
    if (role !== "ADMIN") navigate("/dashboard", { replace: true });
  }, [role, navigate]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const list = await getAdminDoctors({ includeDisabled });
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.message || "Không tải được danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeDisabled]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return rows;
    return rows.filter((d) => {
      const s = `${d.fullName || ""} ${d.username || ""} ${d.email || ""} ${
        d.specialty || ""
      } ${d.department || ""}`.toLowerCase();
      return s.includes(key);
    });
  }, [q, rows]);

  /* ================= EDIT ================= */

  const onOpenEdit = (d) => {
    setEditModel({ ...d });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editModel?.id) return;
    setLoading(true);
    setErr(null);
    try {
      await updateAdminDoctor(editModel.id, {
        fullName: editModel.fullName,
        specialty: editModel.specialty,
        department: editModel.department,
        licenseNo: editModel.licenseNo,
        bio: editModel.bio,
        workingSchedule: editModel.workingSchedule,
      });
      setEditOpen(false);
      setEditModel(null);
      await load();
    } catch (e) {
      setErr(e?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const onAskDelete = (d) => {
    setDeleteTarget(d);
    setDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setLoading(true);
    setErr(null);
    try {
      await deleteAdminDoctor(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setErr(e?.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */

  const onCreateDoctor = async () => {
    setLoading(true);
    setErr(null);
    try {
      await createAdminDoctor(createModel);
      setCreateOpen(false);
      setCreateModel({
        username: "",
        email: "",
        password: "",
        fullName: "",
        specialty: "",
        department: "",
        licenseNo: "",
        workingSchedule: "",
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Tạo bác sĩ thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="auth-container">
      <AppHeader />

      <div className="auth-card" style={{ maxWidth: 1120 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Quản lý danh sách bác sĩ</h2>
            <div className="muted" style={{ marginTop: 6 }}>
              US14.2: Xem danh sách, cập nhật, thêm bác sĩ
            </div>
          </div>
          <button className="btn" onClick={() => navigate("/dashboard")}>
            ← Về Dashboard
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên/email/chuyên khoa..."
            style={{
              flex: 1,
              minWidth: 240,
              padding: 10,
              borderRadius: 12,
              border: "1px solid #223",
              background: "#0f1422",
              color: "#fff",
            }}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(e) => setIncludeDisabled(e.target.checked)}
            />
            Hiển thị cả DISABLED
          </label>

          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Đang tải..." : "Tải lại"}
          </button>

          {/* 🔥 THÊM BÁC SĨ */}
          <button
            className="btn"
            style={{ background: "#22c55e" }}
            onClick={() => setCreateOpen(true)}
          >
            + Thêm bác sĩ
          </button>
        </div>

        {err && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #522",
              background: "#220f12",
              borderRadius: 12,
            }}
          >
            {err}
          </div>
        )}

        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #223" }}>
                <th style={{ padding: 10 }}>Bác sĩ</th>
                <th style={{ padding: 10 }}>Email</th>
                <th style={{ padding: 10 }}>Chuyên khoa</th>
                <th style={{ padding: 10 }}>Khoa</th>
                <th style={{ padding: 10 }}>Trạng thái</th>
                <th style={{ padding: 10, width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #182033" }}>
                  <td style={{ padding: 10 }}>
                    <div style={{ fontWeight: 650 }}>
                      {d.fullName || "(Chưa có tên)"}
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      @{d.username} • ID {d.id}
                    </div>
                  </td>
                  <td style={{ padding: 10 }}>{d.email}</td>
                  <td style={{ padding: 10 }}>{d.specialty || "-"}</td>
                  <td style={{ padding: 10 }}>{d.department || "-"}</td>
                  <td style={{ padding: 10 }}>
                    <Badge>{d.status || "-"}</Badge>
                  </td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn"
                        onClick={() => onOpenEdit(d)}
                        disabled={loading}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn"
                        onClick={() => onAskDelete(d)}
                        disabled={loading || d.status === "DISABLED"}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 14 }} className="muted">
                    Không có bác sĩ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS ================= */}

     {editOpen && editModel && (
  <Modal
    title={`Chỉnh sửa bác sĩ (ID ${editModel.id})`}
    onClose={() => setEditOpen(false)}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      <TextField
        label="Họ tên"
        value={editModel.fullName}
        onChange={(v) =>
          setEditModel((s) => ({ ...s, fullName: v }))
        }
        placeholder="VD: BS. Nguyễn Văn A"
      />

      <TextField
        label="Số chứng chỉ (license)"
        value={editModel.licenseNo}
        onChange={(v) =>
          setEditModel((s) => ({ ...s, licenseNo: v }))
        }
        placeholder="VD: 12345"
      />

      <TextField
        label="Chuyên khoa"
        value={editModel.specialty}
        onChange={(v) =>
          setEditModel((s) => ({ ...s, specialty: v }))
        }
        placeholder="VD: Nội tổng quát"
      />

      <TextField
        label="Khoa / Phòng"
        value={editModel.department}
        onChange={(v) =>
          setEditModel((s) => ({ ...s, department: v }))
        }
        placeholder="VD: Khám tổng quát"
      />

      <div style={{ gridColumn: "1 / -1" }}>
        <TextField
          label="Lịch làm việc"
          value={editModel.workingSchedule}
          onChange={(v) =>
            setEditModel((s) => ({ ...s, workingSchedule: v }))
          }
          placeholder='VD: "T2-T6 08:00-17:00; T7 08:00-11:00"'
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <TextField
          label="Giới thiệu"
          multiline
          value={editModel.bio}
          onChange={(v) =>
            setEditModel((s) => ({ ...s, bio: v }))
          }
          placeholder="Mô tả ngắn về bác sĩ..."
        />
      </div>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 12,
      }}
    >
      <button
        className="btn"
        onClick={() => setEditOpen(false)}
        disabled={loading}
      >
        Hủy
      </button>
      <button
        className="btn"
        onClick={onSaveEdit}
        disabled={loading}
      >
        {loading ? "Đang lưu..." : "Lưu"}
      </button>
    </div>
  </Modal>
)}


     {deleteOpen && deleteTarget && (
  <Modal
    title="Xác nhận xóa"
    onClose={() => setDeleteOpen(false)}
    width={520}
  >
    <div style={{ lineHeight: 1.6 }}>
      Bạn chắc chắn muốn xóa bác sĩ:
      <div style={{ marginTop: 8 }}>
        <b>{deleteTarget.fullName || deleteTarget.username}</b>{" "}
        ({deleteTarget.email})
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        Hành động này sẽ đặt tài khoản về trạng thái <b>DISABLED</b> (soft
        delete) để tránh ảnh hưởng dữ liệu lịch sử.
      </div>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 16,
      }}
    >
      <button
        className="btn"
        onClick={() => setDeleteOpen(false)}
        disabled={loading}
      >
        Hủy
      </button>
      <button
        className="btn"
        onClick={onConfirmDelete}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Xác nhận xóa"}
      </button>
    </div>
  </Modal>
)}


      {createOpen && (
        <Modal title="Thêm bác sĩ mới" onClose={() => setCreateOpen(false)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            <TextField
              label="Username"
              value={createModel.username}
              onChange={(v) =>
                setCreateModel((s) => ({ ...s, username: v }))
              }
            />
            <TextField
              label="Email"
              value={createModel.email}
              onChange={(v) => setCreateModel((s) => ({ ...s, email: v }))}
            />
            <TextField
              label="Mật khẩu (mặc định: 123456)"
              value={createModel.password}
              onChange={(v) =>
                setCreateModel((s) => ({ ...s, password: v }))
              }
            />
            <TextField
              label="Họ tên"
              value={createModel.fullName}
              onChange={(v) =>
                setCreateModel((s) => ({ ...s, fullName: v }))
              }
            />
            <TextField
              label="Chuyên khoa"
              value={createModel.specialty}
              onChange={(v) =>
                setCreateModel((s) => ({ ...s, specialty: v }))
              }
            />
            <TextField
              label="Khoa"
              value={createModel.department}
              onChange={(v) =>
                setCreateModel((s) => ({ ...s, department: v }))
              }
            />
            <TextField
              label="Số chứng chỉ"
              value={createModel.licenseNo}
              onChange={(v) =>
                setCreateModel((s) => ({ ...s, licenseNo: v }))
              }
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextField
                label="Lịch làm việc"
                value={createModel.workingSchedule}
                onChange={(v) =>
                  setCreateModel((s) => ({ ...s, workingSchedule: v }))
                }
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <button className="btn" onClick={() => setCreateOpen(false)}>
              Hủy
            </button>
            <button className="btn" onClick={onCreateDoctor}>
              Lưu
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
