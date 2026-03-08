import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";
import { QRreducer } from "./slices/QrSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    QR: QRreducer,
  },
});
