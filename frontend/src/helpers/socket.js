import { showSessionRequest } from "../store/slices/notificationSlice";
import SessionCreate from "../store/slices/notificationSlice";

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
        break;

      case "session_rejected":
        console.log("Session rejected");
        break;

      default:
        console.log("Unknown event:", data);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return socket;
};

export default socket;
