import React, { useEffect, useMemo, useState } from "react";
import {
  adminListUsers,
  adminChangeRole,
  adminLockUser,
  adminUnlockUser,
} from "../../services/adminUsers";
import "../../assets/styles/auth.css";
import { useNavigate } from "react-router-dom";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  // search
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminListUsers();
      setUsers(data || []);
    } catch (e) {
      setError(e.message || "Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (userId, role) => {
    if (!window.confirm("Xác nhận thay đổi phân quyền?")) return;
    try {
      await adminChangeRole(userId, role);
      setMsg("Cập nhật phân quyền thành công");
      loadUsers();
    } catch (e) {
      alert(e.message || "Không cập nhật được vai trò");
    }
  };

  const toggleLock = async (u) => {
    const ok = window.confirm(
      u.status === "LOCKED" ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"
    );
    if (!ok) return;

    try {
      if (u.status === "LOCKED") {
        await adminUnlockUser(u.id);
        setMsg("Đã mở khóa tài khoản");
      } else {
        await adminLockUser(u.id);
        setMsg("Đã khóa tài khoản");
      }
      loadUsers();
    } catch (e) {
      alert(e.message || "Thao tác thất bại");
    }
  };

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return (users || []).filter((u) => {
      const matchQ =
        !key ||
        (u.username || "").toLowerCase().includes(key) ||
        (u.email || "").toLowerCase().includes(key) ||
        (u.phone || "").toLowerCase().includes(key) ||
        String(u.id || "").includes(key);

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchQ && matchRole && matchStatus;
    });
  }, [users, q, roleFilter, statusFilter]);

  const badgeClass = (status) => {
    if (status === "ACTIVE") return "badge-status completed";
    if (status === "LOCKED") return "badge-status cancelled";
    return "badge-status inprogress";
  };

  return (
    <div className="auth-card" style={{ maxWidth: 980 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Quản lý người dùng</h2>

        <button
          className="chip-btn"
          onClick={() => nav("/admin/users/create")}
        >
          + Tạo tài khoản
        </button>

        <button className="chip-btn" onClick={loadUsers}>
          Refresh
        </button>
      </div>



      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert success">{msg}</div>}

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          margin: "14px 0 18px",
        }}
      >
        <input
          placeholder="Tìm theo username / email / phone / id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 240 }}
        />

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">Tất cả vai trò</option>
          <option value="PATIENT">Bệnh nhân</option>
          <option value="DOCTOR">Bác sĩ</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="LOCKED">LOCKED</option>
          <option value="DISABLED">DISABLED</option>
        </select>

        <button
          className="chip-btn"
          onClick={() => {
            setQ("");
            setRoleFilter("ALL");
            setStatusFilter("ALL");
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p>Không có người dùng phù hợp.</p>
      ) : (
        <table className="visit-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th style={{ width: 140 }}>Vai trò</th>
              <th style={{ width: 120 }}>Trạng thái</th>
              <th style={{ width: 140 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>

                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={u.role === "ADMIN"} // tránh tự phá quyền admin
                  >
                    <option value="PATIENT">Bệnh nhân</option>
                    <option value="DOCTOR">Bác sĩ</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>

                <td>
                  <span className={badgeClass(u.status)}>{u.status}</span>
                </td>

                <td>
                  <button className="chip-btn" onClick={() => toggleLock(u)}>
                    {u.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* small count */}
      {!loading && (
        <div className="muted" style={{ marginTop: 10 }}>
          Tổng: {filtered.length} / {users.length}
        </div>
      )}
    </div>
  );
}
