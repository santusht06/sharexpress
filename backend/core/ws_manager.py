from fastapi import WebSocket
from typing import Dict


class WSManager:
    def __init__(self):
        self.rooms: Dict[str, list[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()

        if room_id not in self.rooms:
            self.rooms[room_id] = []

        self.rooms[room_id].append(websocket)

        print("🧠 ROOMS:", self.rooms)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id].remove(websocket)

            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def send_to_room(self, room_id: str, data: dict):
        for ws in self.rooms.get(room_id, []):
            await ws.send_json(data)


ws_manager = WSManager()
