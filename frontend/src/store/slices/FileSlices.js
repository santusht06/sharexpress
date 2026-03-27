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

/**
 * 🔥 INIT UPLOAD (get presigned URLs)
 */
export const initUpload = createAsyncThunk(
  "files/initUpload",
  async (files, { rejectWithValue }) => {
    try {
      const payload = {
        files: files.map((f) => ({
          file_name: f.name,
          file_size: f.size,
          content_type: f.type,
        })),
      };

      const res = await api.post("/files/init-upload", payload);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload init failed");
    }
  },
);

/**
 * 🔥 COMPLETE UPLOAD
 */
export const completeUpload = createAsyncThunk(
  "files/completeUpload",
  async (files, { rejectWithValue }) => {
    try {
      const res = await api.post("/files/complete-upload", {
        files,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload complete failed");
    }
  },
);

const FileSlice = createSlice({
  name: "files",

  initialState: {
    uploading: false,
    error: null,

    files: [], // 🔥 store files
    progressMap: {}, // 🔥 per-file progress
    uploadSession: null,
  },

  reducers: {
    /**
     * 🔥 SET FILES
     */
    setFiles: (state, action) => {
      state.files = action.payload;
    },

    /**
     * 🔥 PROGRESS PER FILE
     */
    setFileProgress: (state, action) => {
      const { index, progress } = action.payload;
      state.progressMap[index] = progress;
    },

    /**
     * 🔥 RESET
     */
    resetUpload: (state) => {
      state.uploading = false;
      state.error = null;
      state.files = [];
      state.progressMap = {};
      state.uploadSession = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // INIT
      .addCase(initUpload.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })

      .addCase(initUpload.fulfilled, (state, action) => {
        state.uploadSession = action.payload;
      })

      .addCase(initUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      // COMPLETE
      .addCase(completeUpload.fulfilled, (state) => {
        state.uploading = false;
      })

      .addCase(completeUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });
  },
});

export const { setFiles, setFileProgress, resetUpload } = FileSlice.actions;

export const FileReducer = FileSlice.reducer;
