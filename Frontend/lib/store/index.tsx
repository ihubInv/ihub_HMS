import { configureStore } from "@reduxjs/toolkit"
import rootReducer from "./reducers/root.reducer"
import { baseApi } from "./api/base/baseApi"
import { authApi } from "./api/auth/authApi"
import { bookingApi } from "./api/booking/bookingApi"
import { bedApi } from "./api/bed/bedApi"
import { userApi } from "./api/user/userApi"
import { maintenanceApi } from "./api/maintenance/maintenanceApi"
import { reportApi } from "./api/reportApi"
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only persist auth slice
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware, authApi.middleware, bookingApi.middleware, bedApi.middleware, userApi.middleware, maintenanceApi.middleware, reportApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
