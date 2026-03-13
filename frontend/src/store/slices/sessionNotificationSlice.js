import { createSlice } from "@reduxjs/toolkit";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const acceptSession = createAsyncThunk(
  "sessionNotification/accept",
  async ({ qr_token, sender_id }, { rejectWithValue }) => {
    try {
      const res = await api.post("/share/accept", {
        qr_token,
        sender_id,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const rejectSession = createAsyncThunk(
  "sessionNotification/reject",
  async ({ sender_id }, { rejectWithValue }) => {
    try {
      const res = await api.post("/share/reject", {
        sender_id,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

const sessionNotificationSlice = createSlice({
  name: "sessionNotification",

  initialState: {
    visible: false,
    sender_id: null,
    sender_name: null,
    qr_token: null,

    loading: false,
    accepted: false,
    rejected: false,
    error: null,
  },

  reducers: {
    showSessionRequest: (state, action) => {
      state.visible = true;
      state.sender_id = action.payload.sender_id;
      state.sender_name = action.payload.sender_name;
      state.qr_token = action.payload.qr_token;

      state.loading = false;
      state.accepted = false;
      state.rejected = false;
      state.error = null;
    },

    hideSessionRequest: (state) => {
      state.visible = false;
      state.sender_id = null;
      state.sender_name = null;
      state.qr_token = null;

      state.loading = false;
      state.accepted = false;
      state.rejected = false;
      state.error = null;
    },

    setLoading: (state) => {
      state.loading = true;
    },

    acceptSuccess: (state) => {
      state.loading = false;
      state.accepted = true;
    },

    rejectSuccess: (state) => {
      state.loading = false;
      state.rejected = true;
    },

    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(acceptSession.pending, (state) => {
        state.loading = true;
      })

      .addCase(acceptSession.fulfilled, (state) => {
        state.loading = false;
        state.accepted = true;
        state.visible = false;
      })

      .addCase(acceptSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(rejectSession.pending, (state) => {
        state.loading = true;
      })

      .addCase(rejectSession.fulfilled, (state) => {
        state.loading = false;
        state.rejected = true;
        state.visible = false;
      })

      .addCase(rejectSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  showSessionRequest,
  hideSessionRequest,
  setLoading,
  acceptSuccess,
  rejectSuccess,
  setError,
} = sessionNotificationSlice.actions;

export const sessionNotificationReducer = sessionNotificationSlice.reducer;
