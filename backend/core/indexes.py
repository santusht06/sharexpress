from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()


async def create_indexes():
    # share_sessions indexes
    await db.share_sessions.create_index("session_id", unique=True)
    await db.share_sessions.create_index("sender_id")
    await db.share_sessions.create_index("receiver_id")
    await db.share_sessions.create_index("expires_at")
    await db.share_sessions.create_index("status")

    # qr_codes indexes
    await db.qr_codes.create_index("qr_token", unique=True)
