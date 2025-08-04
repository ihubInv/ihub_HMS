import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { removeAuthToken } from "@/lib/utils/api.utils";

interface AuthState {
  user: {
    id: string
    name: string
    role: "admin" | "warden" | "student"
    email: string
  } | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}
debugger

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthState["user"]; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      removeAuthToken(); // Remove token from localStorage
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer
