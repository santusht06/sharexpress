import { showSessionRequest } from "../store/slices/sessionNotificationSlice";

let socket = null;

export const connectSocket = (dispatch) => {
  if (socket) return;

  socket = new WebSocket("ws://localhost:8000/ws", [], {
    withCredentials: true,
  });
  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "session_request") {
        dispatch(showSessionRequest(data));
      }

      if (data.type === "session_cancelled") {
        console.log("Session request cancelled");
      }

      if (data.type === "session_accepted") {
        console.log("Session accepted");
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  };

  socket.onclose = () => {
    console.log(" WebSocket disconnected");

    socket = null;

    setTimeout(() => {
      connectSocket(dispatch);
    }, 3000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

export const getSocket = () => socket;
