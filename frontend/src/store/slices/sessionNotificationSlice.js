import { createSlice } from "@reduxjs/toolkit";

const sessionNotificationSlice = createSlice({
  name: "sessionNotification",

  initialState: {
    visible: false,
    sender_id: null,
    sender_name: null,
    qr_token: null,
  },

  reducers: {
    showSessionRequest: (state, action) => {
      state.visible = true;
      state.sender_id = action.payload.sender_id;
      state.sender_name = action.payload.sender_name;
      state.qr_token = action.payload.qr_token;
    },

    hideSessionRequest: (state) => {
      state.visible = false;
      state.sender_id = null;
      state.sender_name = null;
      state.qr_token = null;
    },
  },
});

export const { showSessionRequest, hideSessionRequest } =
  sessionNotificationSlice.actions;

export const sessionNotificationReducer = sessionNotificationSlice.reducer;
