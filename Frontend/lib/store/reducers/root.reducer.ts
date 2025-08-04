import { combineReducers } from "@reduxjs/toolkit"
import { baseApi } from "../api/base/baseApi"
import { authApi } from "../api/auth/authApi"
import { bookingApi } from "../api/booking/bookingApi"
import { bedApi } from "../api/bed/bedApi"
import { userApi } from "../api/user/userApi"
import { maintenanceApi } from "../api/maintenance/maintenanceApi"
import { reportApi } from "../api/reportApi"
import authReducer from "../slices/auth.slice"

debugger
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [bedApi.reducerPath]: bedApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer,
  auth: authReducer,
  // Add other reducers here as you create more slices
})

export default rootReducer
