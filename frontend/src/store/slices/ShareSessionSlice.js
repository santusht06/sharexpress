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
export const RequestSession = createAsyncThunk(
  "share/request",
  async (qr_token, { rejectWithValue }) => {
    try {
      const res = await api.post("/share/request", { qr_token });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "SESSION REQUEST FAILED");
    }
  },
);

export const checkSession = createAsyncThunk(
  "share/check",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/share/status");
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const SessionSlice = createSlice({
  name: "session",
  initialState: {
    loading: false,
    success: false,
    error: null,

    mode: null,
    requestSent: false,
    rejected: false,

    senderName: null,
    receiverName: null,
  },

  reducers: {
    sessionRejected: (state) => {
      state.rejected = true;
      state.requestSent = false;
    },

    clearSessionState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.mode = null;
      state.requestSent = false;
      state.rejected = false;

      state.senderName = null;
      state.receiverName = null;
    },
    sessionStarted: (state, action) => {
      state.success = true;
      state.mode = action.payload.mode;

      state.senderName = action.payload.sender_name;
      state.receiverName = action.payload.reciever_name;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(SessionCreate.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(SessionCreate.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.error = null;
      state.mode = action.payload.mode;

      state.senderName = action.payload.sender_name;
      state.receiverName = action.payload.reciever_name;
    });
    builder.addCase(SessionCreate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.details || "SESSION CREATION FAILED";
    });

    // REVOKE SESSION STATES INITIALIZED HERE

    builder.addCase(revokeSession.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(revokeSession.fulfilled, (state) => {
      state.loading = false;

      state.success = false; // 👈 card hide hoga
      state.senderName = null;
      state.receiverName = null;
      state.mode = null;
    });

    builder.addCase(revokeSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "SESSION TERMINATE FAILED";
    });

    // REQUEST SESSION STATES

    builder.addCase(RequestSession.pending, (state) => {
      state.loading = true;
      state.requestSent = false;
      state.error = null;
    });

    builder.addCase(RequestSession.fulfilled, (state) => {
      state.loading = false;
      state.requestSent = true;
    });

    builder.addCase(RequestSession.rejected, (state, action) => {
      state.loading = false;
      state.requestSent = false;
      state.error = action.payload || "SESSION REQUEST FAILED";
    });

    builder.addCase(checkSession.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.loading = false;

      if (!action.payload) return;

      state.success = true;
      state.mode = action.payload.mode;

      state.senderName = action.payload.sender_name;
      state.receiverName = action.payload.reciever_name;
    });

    builder.addCase(checkSession.rejected, (state) => {
      state.loading = false;
    });
  },
});
export const { sessionRejected, clearSessionState, sessionStarted } =
  SessionSlice.actions;
export const SessionReducer = SessionSlice.reducer;
