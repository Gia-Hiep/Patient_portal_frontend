<<<<<<< HEAD
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const persistToLocalStorage = store => next => action => {
  const result = next(action);
  const { auth } = store.getState();

  if (auth?.token) {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user || null));
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return result;
};

export const store = configureStore({
  reducer: { auth: authReducer },
  middleware: (getDefault) => getDefault().concat(persistToLocalStorage),
});
=======
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const persistToLocalStorage = store => next => action => {
  const result = next(action);
  const { auth } = store.getState();

  if (auth?.token) {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user || null));
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return result;
};

export const store = configureStore({
  reducer: { auth: authReducer },
  middleware: (getDefault) => getDefault().concat(persistToLocalStorage),
});
>>>>>>> 19f36464b14b0f999ad2f6f209e29ad287387a59
