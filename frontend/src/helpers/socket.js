let socket = null;
import { socketEvent } from "../store/slices/ShareSessionSlice";

export const connectSocket = (qr_id, dispatch) => {
  socket = new WebSocket(`ws://localhost:8000/share/ws/${qr_id}`);

  socket.onopen = () => {
    console.log("✅ WS CONNECTED");

    socket.send(
      JSON.stringify({
        type: "INIT",
        qr_id,
      }),
    );
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log("📩 WS DATA:", data);

    dispatch(socketEvent(data)); // ✅ correct way
  };

  socket.onclose = () => {
    console.log("❌ WS CLOSED");
  };
};
