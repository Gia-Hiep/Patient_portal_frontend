import { postJson } from './api';

// ===== Đăng nhập =====
export function loginApi(username, password) {
  return postJson('/api/auth/login', { username, password });
}

// ===== Quên mật khẩu =====
export function forgotPasswordApi(identifier) {
  return postJson('/api/auth/forgot-password', { identifier });
}

// ===== Đặt lại mật khẩu =====
export function resetPasswordApi(token, newPassword) {
  return postJson('/api/auth/reset-password', { token, newPassword });
}
