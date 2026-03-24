from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(email: str, password: str, db: AsyncSession = Depends(get_db)):
    # Check if the email is already registered
    result = await db.execute(
        text("SELECT id FROM users WHERE email = :email"), {"email": email}
    )
    if result.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(password)
    result = await db.execute(
        text(
            "INSERT INTO users (email, password_hash) VALUES (:email, :hash)"
            " RETURNING id, email, created_at"
        ),
        {"email": email, "hash": hashed},
    )
    await db.commit()
    user = dict(result.fetchone()._mapping)
    token = create_access_token({"sub": str(user["id"])})
    return {"token": token, "user": user}


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("SELECT id, email, password_hash FROM users WHERE email = :email"),
        {"email": form_data.username},
    )
    user = result.fetchone()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    user_dict = dict(user._mapping)
    token = create_access_token({"sub": str(user_dict["id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": str(user_dict["id"]), "email": user_dict["email"]},
    }
