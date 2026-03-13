import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",

  initialState: {
    visible: false,
    sender_id: null,
    sender_name: null,
    qr_token: null,

    loading: false,
    error: null,
  },

  reducers: {
    showSessionRequest: (state, action) => {
      state.visible = true;
      state.sender_id = action.payload.sender_id;
      state.sender_name = action.payload.sender_name;
      state.qr_token = action.payload.qr_token;

      state.loading = false;
      state.error = null;
    },

    hideSessionRequest: (state) => {
      state.visible = false;
      state.sender_id = null;
      state.sender_name = null;
      state.qr_token = null;

      state.loading = false;
      state.error = null;
    },

    acceptStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    acceptSuccess: (state) => {
      state.loading = false;
      state.visible = false;
    },

    rejectStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    rejectSuccess: (state) => {
      state.loading = false;
      state.visible = false;
    },

    setNotificationError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  showSessionRequest,
  hideSessionRequest,
  acceptStart,
  acceptSuccess,
  rejectStart,
  rejectSuccess,
  setNotificationError,
} = notificationSlice.actions;

export const notificationReducer = notificationSlice.reducer;
