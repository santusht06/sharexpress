import { showSessionRequest } from "../store/slices/sessionNotificationSlice";
import {
  SessionCreate,
  sessionRejected,
  sessionStarted,
} from "../store/slices/ShareSessionSlice";
import { toast } from "react-toastify";

let socket = null;

export const connectSocket = (user_id, dispatch) => {
  socket = new WebSocket(`ws://localhost:8000/share/ws/${user_id}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "session_request":
        dispatch(showSessionRequest(data));
        break;

      case "session_accepted":
        dispatch(SessionCreate(data.qr_token));
        toast.success("Session accepted");
        break;

      case "session_rejected":
        dispatch(sessionRejected());
        toast.error("Session rejected");
        break;
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };
};
