import { AuthInterface } from '@/lib/interfaces/authInteface';
import { cookies } from '@/lib/utils/cookies';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export interface AuthState {
  isAuthenticated: null | boolean;
  user: AuthInterface;
  token: string 
}

const { token, user } = cookies.get();

const initialState: AuthState = {
  isAuthenticated: token ? true : false,
  user: user as AuthInterface,
  // token: cookies.get() as string,
  token: token as string,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: AuthInterface; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      cookies.set(action.payload.token, action.payload.user);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = {} as AuthInterface;
      state.token = '';
      cookies.remove();
    },
    validateToken: (state) => {
      const { token, user } = cookies.get();
      if (token) {
        state.isAuthenticated = true;
        state.user = user as AuthInterface;
        state.token = token;
      } else {
        state.isAuthenticated = false;
        state.user = {} as AuthInterface;
        state.token = '';
      }
    }
  },
});

export const { setUser, logout, validateToken } = authSlice.actions;
export default authSlice.reducer;
