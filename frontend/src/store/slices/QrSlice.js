// Copyright 2026 Sharexpress
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
//
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

export const ResolveQR = createAsyncThunk(
  "QR/resolve",
  async (qr_token, { rejectWithValue }) => {
    try {
      const res = await api.post("/QR/resolve", { qr_token });
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

    // RESOLVE QR RECIEVER INITIAL STATE DESCRIBE HERE
    reciever: null,
    reciever_email: null,
    reciever_loading: false,
    reciever_success: false,
    reciever_error: null,
    reciever_token: null,

    qr_token: null,
    qr_loading: false,
    qr_error: null,

    resolved_qr: null,
    resolved_loading: false,
    resolved_error: null,

    qr_owner: null,
    qr_security: null,
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

    // RECIEVER STATES DEFINE HERE
    builder
      .addCase(ResolveQR.pending, (state) => {
        state.receiver_loading = true;
        state.receiver_error = null;
        state.receiver_success = false;
      })

      .addCase(ResolveQR.rejected, (state, action) => {
        state.receiver_loading = false;
        state.receiver_success = false;
        state.receiver_error = action.payload?.error || "QR RESOLVE FAILED";
      });

    builder.addCase(ResolveQR.fulfilled, (state, action) => {
      state.resolved_loading = false;

      const data = action.payload;

      state.resolved_qr = {
        qr_id: data.qr_id,
        mode: data.mode,
        is_own_qr: data.is_own_qr,
      };

      state.qr_owner = data.owner_info;

      state.qr_security = data.security;
    });
  },
});

export const QRreducer = QRslice.reducer;
