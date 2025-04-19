import { IAcccountState, IAccountDataProps } from '@/lib/interfaces'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: IAcccountState = {
  accounts: [] as IAccountDataProps[],
  loading: false,
  error: null as string | null,
  success: false,
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<IAccountDataProps[]>) => {
      state.accounts = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload
    },
    addAccount: (state, action: PayloadAction<IAccountDataProps>) => {
      state.accounts.push(action.payload)
    },
    logoutAccountAction: (state) => { 
      state.accounts = []
      state.loading = false
      state.error = null
      state.success = false
    }
  }
})

export const { setAccounts, setLoading, setError, setSuccess, addAccount, logoutAccountAction } = accountSlice.actions
export default accountSlice.reducer
