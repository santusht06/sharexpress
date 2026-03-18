from fastapi import WebSocket
from typing import Dict


class WSManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, QR_ID: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[QR_ID] = websocket

    def disconnect(self, QR_ID: str):
        self.active_connections.pop(QR_ID, None)

    async def send_to_user(self, QR_ID: str, data: dict):
        ws = self.active_connections.get(QR_ID)
        if ws:
            await ws.send_json(data)


ws_manager = WSManager()
