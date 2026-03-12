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
  async (_, { getState, rejectWithValue }) => {
    const { QRToken } = getState().QR;

    if (QRToken) {
      return { qr_token: QRToken };
    }

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
      return rejectWithValue(err.response?.data || "QR Resolve failed");
    }
  },
);

export const SearchEmail = createAsyncThunk(
  "auth/email",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/search", { email });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "EMAIL SEARCH FAILED");
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

    reciever_name: null,
    reciever_email: null,
    reciever_img: null,

    reciever_loading: false,
    reciever_success: false,
    reciever_error: null,

    reciever_qr: null,

    resolved_qr: null,
    qr_owner: null,
    qr_security: null,
  },

  reducers: {
    clearReceiver: (state) => {
      state.reciever_name = null;
      state.reciever_email = null;
      state.reciever_img = null;

      state.reciever_qr = null;

      state.reciever_success = false;
      state.reciever_error = null;

      state.resolved_qr = null;
      state.qr_owner = null;
      state.qr_security = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(GenerateQRCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(GenerateQRCode.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.QRToken = action.payload.qr_token;
      })

      .addCase(GenerateQRCode.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "QR GENERATE FAILED";
      });

    builder
      .addCase(ResolveQR.pending, (state) => {
        state.reciever_loading = true;
        state.reciever_error = null;
        state.reciever_success = false;
      })

      .addCase(ResolveQR.fulfilled, (state, action) => {
        state.reciever_loading = false;
        state.reciever_success = true;

        const data = action.payload;

        state.resolved_qr = {
          qr_id: data.qr_id,
          mode: data.mode,
          is_own_qr: data.is_own_qr,
        };

        state.reciever_qr = data.qr_token;

        state.reciever_name = data.owner_info?.name || null;
        state.reciever_email = data.owner_info?.email || null;
        state.reciever_img = data.owner_info?.picture || null;

        state.qr_owner = data.owner_info || null;
        state.qr_security = data.security || null;
      })

      .addCase(ResolveQR.rejected, (state, action) => {
        state.reciever_loading = false;
        state.reciever_success = false;
        state.reciever_error = action.payload || "QR RESOLVE FAILED";
      });

    // SEARCH BY EMAIL SLICES

    builder
      .addCase(SearchEmail.pending, (state) => {
        state.reciever_loading = true;
        state.reciever_error = null;
        state.reciever_success = false;
      })

      .addCase(SearchEmail.fulfilled, (state, action) => {
        state.reciever_loading = false;
        state.reciever_success = true;

        const data = action.payload;

        state.reciever_qr = data?.qr_token || null;

        state.reciever_name = data?.owner_info?.name || data?.name || null;
        state.reciever_email = data?.owner_info?.email || data?.email || null;
        state.reciever_img = data?.owner_info?.picture || data?.picture || null;

        state.qr_owner = data?.owner_info || null;
        state.qr_security = data?.security || null;
      })

      .addCase(SearchEmail.rejected, (state, action) => {
        state.reciever_loading = false;
        state.reciever_success = false;
        state.reciever_error = action.payload || "EMAIL SEARCH FAILED";
      });
  },
});

export const { clearReceiver } = QRslice.actions;

export const QRreducer = QRslice.reducer;
