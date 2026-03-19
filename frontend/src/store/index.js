import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import toastReducer from './toastSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    toast: toastReducer,
  },
});
