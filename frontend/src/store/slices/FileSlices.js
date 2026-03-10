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
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const initUpload = createAsyncThunk(
  "files/initUpload",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/files/init-upload");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload init failed");
    }
  },
);

const FileSlice = createSlice({
  name: "files",

  initialState: {
    uploadSession: null,
    uploading: false,
    progress: 0,
    error: null,
  },

  reducers: {
    setUploadProgress: (state, action) => {
      state.progress = action.payload;
    },

    resetUpload: (state) => {
      state.uploadSession = null;
      state.progress = 0;
      state.uploading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(initUpload.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })

      .addCase(initUpload.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadSession = action.payload;
      })

      .addCase(initUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });
  },
});

export const { setUploadProgress, resetUpload } = FileSlice.actions;

export const FileReducer = FileSlice.reducer;
