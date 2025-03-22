import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from '@/lib/redux/slices/authSlice';

export interface RootState {
  auth: AuthState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
