<<<<<<< HEAD
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  role: JSON.parse(localStorage.getItem('user') || '{}')?.role || null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state){ state.status = 'loading'; state.error = null; },
    loginSuccess(state, action){
      const { token, user } = action.payload;
      state.status = 'succeeded';
      state.token = token;
      state.user = user;
      state.role = user?.role || null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure(state, action){ state.status = 'failed'; state.error = action.payload || 'Login failed'; },
    logout(state){
      state.token = null;
      state.user = null;
      state.role = null;
      state.status = 'idle';
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  }
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
=======
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  role: JSON.parse(localStorage.getItem('user') || '{}')?.role || null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state){ state.status = 'loading'; state.error = null; },
    loginSuccess(state, action){
      const { token, user } = action.payload;
      state.status = 'succeeded';
      state.token = token;
      state.user = user;
      state.role = user?.role || null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure(state, action){ state.status = 'failed'; state.error = action.payload || 'Login failed'; },
    logout(state){
      state.token = null;
      state.user = null;
      state.role = null;
      state.status = 'idle';
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  }
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
>>>>>>> 19f36464b14b0f999ad2f6f209e29ad287387a59
