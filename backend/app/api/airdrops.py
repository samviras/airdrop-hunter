from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()


@router.get("")
async def list_airdrops(
    status: str = None,
    chain: str = None,
    db: AsyncSession = Depends(get_db),
):
    query = "SELECT * FROM airdrops WHERE 1=1"
    params: dict = {}

    if status:
        query += " AND status = :status"
        params["status"] = status
    if chain:
        query += " AND chain = :chain"
        params["chain"] = chain

    query += (
        " ORDER BY CASE status"
        " WHEN 'claimable' THEN 1"
        " WHEN 'upcoming' THEN 2"
        " WHEN 'expired' THEN 3"
        " END, name"
    )

    result = await db.execute(text(query), params)
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]


@router.get("/{airdrop_id}")
async def get_airdrop(airdrop_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM airdrops WHERE id = :id"), {"id": airdrop_id}
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Airdrop not found")
    return dict(row._mapping)
