import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.auth import get_current_user

router = APIRouter()


@router.get("")
async def list_wallets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("SELECT * FROM wallets WHERE user_id = :user_id ORDER BY created_at DESC"),
        {"user_id": str(current_user["id"])},
    )
    return [dict(row._mapping) for row in result.fetchall()]


@router.post("")
async def add_wallet(
    wallet: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    address = wallet.get("address", "")
    chain = wallet.get("chain", "ethereum")
    label = wallet.get("label")

    if not re.match(r"^0x[0-9a-fA-F]{40}$", address):
        raise HTTPException(status_code=400, detail="Invalid EVM address")

    try:
        result = await db.execute(
            text(
                """
                INSERT INTO wallets (user_id, address, chain, label)
                VALUES (:user_id, :address, :chain, :label)
                ON CONFLICT (address, chain) DO UPDATE SET label = EXCLUDED.label
                RETURNING *
                """
            ),
            {
                "user_id": str(current_user["id"]),
                "address": address.lower(),
                "chain": chain,
                "label": label,
            },
        )
        await db.commit()
        return dict(result.fetchone()._mapping)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{wallet_id}")
async def delete_wallet(
    wallet_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text(
            "DELETE FROM wallets WHERE id = :id AND user_id = :user_id RETURNING id"
        ),
        {"id": wallet_id, "user_id": str(current_user["id"])},
    )
    await db.commit()
    if not result.fetchone():
        raise HTTPException(status_code=404, detail="Wallet not found")
    return {"deleted": True}
