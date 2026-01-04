import React, { useEffect, useMemo, useState } from "react";
import {
  adminListUsers,
  adminChangeRole,
  adminLockUser,
  adminUnlockUser,
} from "../../services/adminUsers";
import "../../assets/styles/adminUsers.css";
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
    <div className="au-page auth-card">
      {/* Header */}
      <div className="au-header">
        <div className="au-headerLeft">
          <button
            className="au-btn au-btnGhost au-backBtn"
            onClick={() => nav("/dashboard")}
            type="button"
          >
            ← Quay lại Dashboard
          </button>

          <h2 className="au-title">Quản lý người dùng</h2>
        </div>

        <div className="au-headerActions">
          <button className="au-btn au-btnGhost" onClick={loadUsers}>
            Refresh
          </button>

          <button
            className="au-btn au-btnPrimary"
            onClick={() => nav("/admin/users/create")}
          >
            + Tạo tài khoản
          </button>
        </div>
      </div>


      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert success">{msg}</div>}

      {/* Filters */}
      <section className="au-filtersCard">
        <div className="au-filtersGrid">
          {/* Search */}
          <div className="au-field au-fieldSearch">
            <div className="au-label">TÌM KIẾM</div>
            <div className="au-inputWrap">
              <span className="au-inputIcon" aria-hidden="true">
                🔎
              </span>
              <input
                className="au-input"
                placeholder="Tìm theo username / email / phone / id..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* Role */}
          <div className="au-field">
            <div className="au-label">VAI TRÒ</div>
            <select
              className="au-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="PATIENT">Bệnh nhân</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          {/* Status */}
          <div className="au-field">
            <div className="au-label">TRẠNG THÁI</div>
            <select
              className="au-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOCKED">LOCKED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          {/* Reset (same handler, same text) */}
          <div className="au-field au-fieldReset">
            <button
              className="au-reset"
              onClick={() => {
                setQ("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="au-tableCard">
        {loading ? (
          <p className="au-loading">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="au-empty">Không có người dùng phù hợp.</p>
        ) : (
          <div className="au-tableWrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th className="au-th au-thId">ID</th>
                  <th className="au-th">USERNAME</th>
                  <th className="au-th">EMAIL</th>
                  <th className="au-th au-thRole">VAI TRÒ</th>
                  <th className="au-th au-thStatus">TRẠNG THÁI</th>
                  <th className="au-th au-thActions">THAO TÁC</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="au-tr">
                    <td className="au-td au-tdId">#{u.id}</td>

                    <td className="au-td">
                      <div className="au-userCell">
                        <div className="au-avatar" aria-hidden="true" />
                        <div className="au-userText">
                          <div className="au-username">{u.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="au-td au-email">{u.email}</td>

                    <td className="au-td">
                      <select
                        className="au-select au-selectInline"
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={u.role === "ADMIN"}
                      >
                        <option value="PATIENT">Bệnh nhân</option>
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>

                    <td className="au-td au-tdStatus">
                      <span className={badgeClass(u.status)}>{u.status}</span>
                    </td>

                    <td className="au-td au-tdActions">
                      <button
                        className={`au-lockBtn ${u.status === "LOCKED" ? "unlock" : "lock"
                          }`}
                        onClick={() => toggleLock(u)}
                        type="button"
                      >
                        {u.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="au-footer">
              <div className="au-count muted">
                Tổng: {filtered.length} / {users.length}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
