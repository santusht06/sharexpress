import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const SessionCreate = createAsyncThunk(
  "share/create",
  async (qr_token, { rejectWithValue }) => {
    try {
      const res = await api.post("/share/create", { qr_token });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Session Creation failed");
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
    error: false,

    success: null,
    mode: null,
    sharing_token: null,
    session_id: null,
    sender_name: null,
    sender_type: null,
    sender_ID: null,
    receiver_ID: null,
    receiver_type: null,
    reciever_name: null,
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

      state.sharing_token = action.payload.sharing_token;
      state.sender_name = action.payload.sender_name;
      state.sender_type = action.payload.sender_type;
      state.sender_ID = action.payload.sender_ID;

      state.receiver_ID = action.payload.receiver_ID;
      state.receiver_type = action.payload.receiver_type;
      state.reciever_name = action.payload.reciever_name;
    });
    builder.addCase(SessionCreate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.details || "SESSION CREATION FAILED";

      state.sender_name = null;
      state.sender_type = null;
      state.sender_ID = null;
      state.receiver_ID = null;
      state.receiver_type = null;
      state.reciever_name = null;
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
