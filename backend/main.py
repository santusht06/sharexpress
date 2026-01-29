import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from routers.user_routes import router as User_router
from starlette.middleware.sessions import SessionMiddleware


load_dotenv()


origins = ["*"]


app = FastAPI()


app.add_middleware(SessionMiddleware, secret_key="SUPER_SECRET_RANDOM_STRING")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(User_router)


@app.get("/health")
async def health():
    return {"PASSED": True}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
