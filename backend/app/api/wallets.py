import re
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_supabase
from app.core.auth import get_current_user

router = APIRouter()


@router.get("")
async def list_wallets(current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = db.table("wallets").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data or []


@router.post("")
async def add_wallet(wallet: dict, current_user: dict = Depends(get_current_user)):
    address = wallet.get("address", "")
    chain = wallet.get("chain", "ethereum")
    label = wallet.get("label")

    if not re.match(r"^0x[0-9a-fA-F]{40}$", address):
        raise HTTPException(status_code=400, detail="Invalid EVM address")

    db = get_supabase()
    
    # Check if exists
    existing = db.table("wallets").select("*").eq("address", address.lower()).eq("chain", chain).execute()
    
    if existing.data:
        # Update label
        result = db.table("wallets").update({"label": label}).eq("id", existing.data[0]["id"]).execute()
        return result.data[0] if result.data else existing.data[0]
    else:
        # Insert new
        result = db.table("wallets").insert({
            "user_id": current_user["id"],
            "address": address.lower(),
            "chain": chain,
            "label": label,
        }).execute()
        return result.data[0] if result.data else {}


@router.delete("/{wallet_id}")
async def delete_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = db.table("wallets").delete().eq("id", wallet_id).eq("user_id", current_user["id"]).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return {"deleted": True}
