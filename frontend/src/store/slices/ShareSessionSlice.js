import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const SessionCreate = createAsyncThunk(
  "share/create",
  async (qr_token, { rejectWithValue }) => {
    try {
      const res = await api.post("/share/create", { qr_token });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "SESSION CREATE FAILED");
    }
  },
);

export const revokeSession = createAsyncThunk(
  "share/revoke",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete("/share/revoke");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "SESSION REVOKE FAILED");
    }
  },
);

export const SessionSlice = createSlice({
  name: "session",
  initialState: {
    loading: false,
    success: false,
    error: false,
    mode: null,
  },

  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(SessionCreate.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(SessionCreate.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.error = null;
      state.mode = action.payload.mode;
    });
    builder.addCase(SessionCreate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.details || "SESSION CREATION FAILED";
    });

    // REVOKE SESSION STATES INITIALIZED HERE

    builder.addCase(revokeSession.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(revokeSession.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(revokeSession.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload?.details || "REVOKE SESSION FAILED";
    });
  },
});

export const SessionReducer = SessionSlice.reducer;
