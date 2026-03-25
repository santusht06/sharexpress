import { socketEvent } from "../store/slices/ShareSessionSlice";

let socket = null;

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
    dispatch(socketEvent(data));
  };

  socket.onclose = () => {
    console.log("❌ WS CLOSED");
  };
};

// ✅ ADD THIS
export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
