import { loginApi, forgotPasswordApi, resetPasswordApi } from '../services/auth';
import { loginStart, loginSuccess, loginFailure } from './authSlice';

export const loginThunk = (username, password) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const res = await loginApi(username, password);
    dispatch(loginSuccess(res)); 
    return res;
  } catch (err) {
    dispatch(loginFailure(err?.message || 'Login failed'));
    throw err;
  }
};

export const forgotPasswordThunk = (identifier) => async () => {
  return forgotPasswordApi(identifier);
};

export const resetPasswordThunk = (token, newPassword) => async () => {
  return resetPasswordApi(token, newPassword);
};
