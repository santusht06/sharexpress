import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchHistory = createAsyncThunk(
  "history/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/history"); // 🔥 your route
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch history");
    }
  },
);

export const fetchSessionHistory = createAsyncThunk(
  "history/session",
  async (session_id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/history/${session_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch session history",
      );
    }
  },
);

const historySlice = createSlice({
  name: "history",

  initialState: {
    loading: false,
    error: null,

    histories: [],

    session_loading: false,
    session_error: null,
    session_history: null,
  },

  reducers: {
    clearHistory: (state) => {
      state.histories = [];
      state.error = null;
    },

    clearSessionHistory: (state) => {
      state.session_history = null;
      state.session_error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.histories = action.payload?.history || [];
    });

    builder.addCase(fetchHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchSessionHistory.pending, (state) => {
      state.session_loading = true;
      state.session_error = null;
    });

    builder.addCase(fetchSessionHistory.fulfilled, (state, action) => {
      state.session_loading = false;
      state.session_history = action.payload?.history || null;
    });
    builder.addCase(fetchSessionHistory.rejected, (state, action) => {
      state.session_loading = false;
      state.session_error = action.payload;
    });
  },
});

export const { clearHistory, clearSessionHistory } = historySlice.actions;

export const historyReducer = historySlice.reducer;
