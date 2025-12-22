from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.asset import Asset
from app.models.location import School, Area
from app.models.update_log import UpdateLog
from app.models.user import User
from app.schemas.asset import AssetResponse, AssetCreate, AssetUpdate, AssetPaginatedResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def get_location_info(db: Session, school_id: int):
    school = db.query(School).options(joinedload(School.area)).filter(School.id == school_id).first()
    if school:
        return school.name, (school.area.name if school.area else "Unknown Area")
    return "Unknown School", "Unknown Area"

@router.get("/", response_model=AssetPaginatedResponse)
def read_assets(
    school_id: Optional[int] = None,
    page: int = 1,
    size: int = 10,
    type_code: Optional[str] = None,
    category_code: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Asset)

    if school_id:
        school = db.query(School).filter(School.id == school_id).first()
        if not school:
            raise HTTPException(status_code=404, detail="Sekolah tidak ditemukan")
        query = query.filter(Asset.school_id == school_id)
    
    if type_code:
        query = query.filter(Asset.type_code == type_code)
    
    if category_code:
        query = query.filter(Asset.category_code == category_code)
    
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Asset.barcode.ilike(search_fmt)) | 
            (Asset.serial_number.ilike(search_fmt)) |
            (Asset.brand.ilike(search_fmt)) |
            (Asset.model_series.ilike(search_fmt))
        )

    total = query.count()

    sort_fields = {
        "barcode": Asset.barcode,
        "brand": Asset.brand,
        "model_series": Asset.model_series,
        "serial_number": Asset.serial_number,
        "status": Asset.status,
        "created_at": Asset.created_at,
        "updated_at": Asset.updated_at,
        "asset_name": Asset.brand,
        "city_code": Asset.city_code,
        "type_code": Asset.type_code,
        "category_code": Asset.category_code,
        "subcategory_code": Asset.subcategory_code,
        "procurement_month": Asset.procurement_month,
        "procurement_year": Asset.procurement_year,
        "floor": Asset.floor,
        "sequence_number": Asset.sequence_number,
        "placement": Asset.placement,
        "room": Asset.room,
        "ip_address": Asset.ip_address,
        "mac_address": Asset.mac_address,
        "username": Asset.username,
        "password": Asset.password,
        "assigned_to": Asset.assigned_to,
        "ram": Asset.ram,
        "processor": Asset.processor,
        "storage": Asset.storage,
        "os": Asset.os,
        "connect_to": Asset.connect_to,
        "channel": Asset.channel
    }
    
    db_sort_field = sort_fields.get(sort_by, Asset.created_at)
    
    if sort_order == "asc":
        query = query.order_by(db_sort_field.asc())
    else:
        query = query.order_by(db_sort_field.desc())

    skip = (page - 1) * size
    assets = query.options(
        joinedload(Asset.school).joinedload(School.area)
    ).offset(skip).limit(size).all()

    return {
        "items": assets,
        "total": total,
        "page": page,
        "size": size
    }

@router.get("/{asset_id}", response_model=AssetResponse)
def read_asset_detail(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Aset tidak ditemukan")
    return asset

@router.post("/", response_model=AssetResponse)
def create_asset(
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_asset = db.query(Asset).filter(Asset.barcode == asset_in.barcode).first()
    if existing_asset:
        raise HTTPException(status_code=400, detail=f"Barcode {asset_in.barcode} sudah terdaftar!")

    new_asset = Asset(**asset_in.dict())

    try:
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        school_name, area_name = get_location_info(db, new_asset.school_id)
        
        actor_name = current_user.full_name if current_user.full_name else current_user.email

        log = UpdateLog(
            asset_barcode=new_asset.barcode,
            asset_name=f"{new_asset.brand} - {new_asset.model_series}",
            action="CREATE",
            details="Menambahkan aset baru ke database",
            actor=actor_name,
            school_name=school_name,
            area_name=area_name
        )
        db.add(log)
        db.commit()

        return new_asset
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset_in: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Aset tidak ditemukan")

    update_data = asset_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)

    db.add(asset)
    db.commit()
    db.refresh(asset)
    school_name, area_name = get_location_info(db, asset.school_id)
    
    actor_name = current_user.full_name if current_user.full_name else current_user.email

    log = UpdateLog(
        asset_barcode=asset.barcode,
        asset_name=f"{asset.brand} - {asset.model_series}",
        action="UPDATE",
        details="Memperbarui data aset",
        actor=actor_name,
        school_name=school_name,
        area_name=area_name
    )
    db.add(log)
    db.commit()

    return asset

@router.delete("/{asset_id}", response_model=AssetResponse)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).options(joinedload(Asset.school)).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Aset tidak ditemukan")
    
    school_name, area_name = get_location_info(db, asset.school_id)
    actor_name = current_user.full_name if current_user.full_name else current_user.email
    deleted_asset_response = AssetResponse.model_validate(asset)

    log = UpdateLog(
        asset_barcode=asset.barcode,
        asset_name=f"{asset.brand} - {asset.model_series}",
        action="DELETE",
        details="Menghapus aset dari database",
        actor=actor_name,
        school_name=school_name,
        area_name=area_name
    )
    db.add(log)

    db.delete(asset)
    db.commit()

    return deleted_asset_response