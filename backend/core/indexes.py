# Copyright 2026 sharexpress
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#
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
