from fastapi import APIRouter, HTTPException
from app.core.database import get_supabase

router = APIRouter()


@router.get("")
async def list_airdrops(status: str = None, chain: str = None):
    db = get_supabase()
    query = db.table("airdrops").select("*")

    if status:
        query = query.eq("status", status)
    if chain:
        query = query.eq("chain", chain)

    result = query.order("status").order("name").execute()
    return result.data or []


@router.get("/{airdrop_id}")
async def get_airdrop(airdrop_id: str):
    db = get_supabase()
    result = db.table("airdrops").select("*").eq("id", airdrop_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Airdrop not found")
    return result.data[0]
