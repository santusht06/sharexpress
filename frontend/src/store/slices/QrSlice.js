import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const GenerateQRCode = createAsyncThunk(
  "QR/generate",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/QR/create");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "QR Generate failed");
    }
  },
);

export const QRslice = createSlice({
  name: "QR",
  initialState: {
    QRToken: null,
    loading: false,
    error: null,
    success: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(GenerateQRCode.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(GenerateQRCode.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.error = null;
      state.QRToken = action.payload.qr_token;
    });
    builder.addCase(GenerateQRCode.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload?.error || "QR GENERATE FAILED";
    });
  },
});

export const QRreducer = QRslice.reducer;
