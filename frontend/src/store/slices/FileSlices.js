import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const initUpload = createAsyncThunk(
  "files/initUpload",
  async (files, { rejectWithValue }) => {
    try {
      const payload = {
        files: files.map((f) => ({
          filename: f.name,
          size: f.size,
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
    files: [],
    progressMap: {},
    statusMap: {},
  },

  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.progressMap = {};
      state.statusMap = {};
    },

    setFileProgress: (state, action) => {
      const { index, progress } = action.payload;
      state.progressMap[index] = progress;
    },

    setFileStatus: (state, action) => {
      const { index, status } = action.payload;
      state.statusMap[index] = status;
    },

    resetUpload: (state) => {
      state.uploading = false;
      state.error = null;
      state.files = [];
      state.progressMap = {};
      state.statusMap = {};
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(initUpload.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(initUpload.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(initUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      .addCase(completeUpload.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(completeUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });
  },
});

export const { setFiles, setFileProgress, setFileStatus, resetUpload } =
  FileSlice.actions;

export const FileReducer = FileSlice.reducer;
