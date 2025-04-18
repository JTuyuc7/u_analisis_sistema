import { configureStore } from '@reduxjs/toolkit';
import { AuthState, IAcccountState } from '../interfaces';
import authReducer from '@/lib/redux/slices/authSlice';
import accountReducer from '@/lib/redux/slices/accountSlice';
export interface RootState {
  auth: AuthState;
  account: IAcccountState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer
  },
});

export type AppDispatch = typeof store.dispatch;
