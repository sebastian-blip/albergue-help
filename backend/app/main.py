from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.shelters import router as shelters_router
from app.modules.users.router import auth_router, users_router

app = FastAPI(
    title=settings.APP_NAME,
    description="API para encontrar albergues disponibles durante emergencias en Colombia.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(shelters_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
