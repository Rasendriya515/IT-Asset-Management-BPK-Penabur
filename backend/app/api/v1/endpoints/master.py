from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.master import MasterOption
from app.schemas.master import MasterOptionCreate, MasterOptionUpdate, MasterOptionResponse
from app.api.deps import get_current_admin, get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[MasterOptionResponse])
def read_master_options(
    category: Optional[str] = None,
    parent_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    query = db.query(MasterOption)
    if category:
        query = query.filter(MasterOption.category == category)
    if parent_code:
        query = query.filter(MasterOption.parent_code == parent_code)
    
    return query.all()

@router.post("/", response_model=MasterOptionResponse)
def create_master_option(
    option_in: MasterOptionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    exists = db.query(MasterOption).filter(
        MasterOption.category == option_in.category,
        MasterOption.code == option_in.code
    ).first()
    
    if exists:
        raise HTTPException(status_code=400, detail=f"Kode '{option_in.code}' sudah ada di kategori '{option_in.category}'")

    new_option = MasterOption(
        category=option_in.category,
        code=option_in.code,
        label=option_in.label,
        parent_code=option_in.parent_code
    )
    db.add(new_option)
    db.commit()
    db.refresh(new_option)
    return new_option

@router.delete("/{option_id}")
def delete_master_option(
    option_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    option = db.query(MasterOption).filter(MasterOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    
    db.delete(option)
    db.commit()
    return {"status": "success", "message": "Opsi berhasil dihapus"}