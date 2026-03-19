let socket = null;

export const connectSocket = (QR_ID, dispatch) => {
  socket = new WebSocket(`ws://localhost:8000/share/ws/${QR_ID}`);

  socket.onopen = () => {
    console.log("WebSocket connected");

    socket.send(
      JSON.stringify({
        type: "INIT",
        qr_id: QR_ID,
      }),
    );
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log(data);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };
};
