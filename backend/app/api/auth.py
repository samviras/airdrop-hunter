from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.database import get_supabase
from app.core.auth import hash_password, verify_password, create_access_token

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    db = get_supabase()
    
    # Check if email exists
    existing = db.table("users").select("id").eq("email", request.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(request.password)
    result = db.table("users").insert({
        "email": request.email,
        "password_hash": hashed,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]
    token = create_access_token({"sub": str(user["id"])})
    return {"token": token, "user": {"id": user["id"], "email": user["email"]}}


@router.post("/login")
async def login(request: LoginRequest):
    db = get_supabase()
    
    result = db.table("users").select("*").eq("email", request.email).execute()
    
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"]},
    }
