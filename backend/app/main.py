from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import scan, airdrops, wallets, auth

app = FastAPI(
    title="AirdropHunter API",
    version="1.0.0",
    description="Scan crypto wallets and find unclaimed airdrops.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(scan.router, prefix="/api/v1", tags=["scan"])
app.include_router(airdrops.router, prefix="/api/v1/airdrops", tags=["airdrops"])
app.include_router(wallets.router, prefix="/api/v1/wallets", tags=["wallets"])


@app.get("/health")
async def health():
    return {"status": "ok"}
