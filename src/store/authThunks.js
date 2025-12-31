import {
  loginApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "../services/auth";
import { loginStart, loginSuccess, loginFailure } from "./authSlice";

export const loginThunk = (username, password) => async (dispatch) => {
  try {
    dispatch(loginStart());

    const res = await loginApi(username, password);

    // ✅ LƯU TOKEN để các API khác (US16) tự gắn Authorization
    // Backend thường trả: { token, role, ... } hoặc { accessToken, role, ... }
    const token = res?.token || res?.accessToken || res?.jwt;
    if (token) localStorage.setItem("token", token);

    // ✅ (tuỳ chọn) lưu role để FE phân quyền route/admin
    if (res?.role) localStorage.setItem("role", res.role);

    dispatch(loginSuccess(res));
    return res;
  } catch (err) {
    dispatch(loginFailure(err?.message || "Login failed"));
    throw err;
  }
};

export const forgotPasswordThunk = (identifier) => async () => {
  return forgotPasswordApi(identifier);
};

export const resetPasswordThunk = (token, newPassword) => async () => {
  return resetPasswordApi(token, newPassword);
};
