import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../../api/api";

export const SendOTP = createAsyncThunk(
  "auth/SENDOTP",

  async (email) => {
    const response = await api.post("/auth/sendOTP");
    return response.data;
  },
);

export const VerifyOTP = createAsyncThunk(
  "auth/verifyOTP",

  async ({ data }) => {
    const response = await api.post("auth/verifyOTP", data);
    return response.data;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },

  extraReducers: (builder) => {
    // pending case
    builder.addCase(SendOTP.pending, (state) => {
      state.loading = true;
    });
    // resolved or success case
    builder.addCase(SendOTP.fulfilled, (state) => {
      state.loading = false;
    });
    // Rejected sendotp case
    builder.addCase(SendOTP.rejected, (state) => {
      state.loading = false;
      state.error = SendOTP.data.response || "OTP FAILED";
    });

    // SECTION 2 FOR VERIFICATION OTP

    // PENDING CASE 1 FOR VERIFICATION

    builder.addCase(VerifyOTP.pending, (state) => {
      state.loading = true;
    });

    // SUCCESS OR RESOLVED CASE 2
    builder.addCase(VerifyOTP.fulfilled, (state, action) => {
      state.loading = false;

      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem("token", action.payload.token);
    });

    // REJECTED CASE FOR VERIFICATION API CASE 3

    builder.addCase(VerifyOTP.rejected, (state) => {
      state.loading = false;
      state.error = VerifyOTP.response || "VERIFICATION FAILED";
    });
  },
});
