from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.asset import Asset
from app.models.location import School, Area
from app.models.update_log import UpdateLog
from app.schemas.asset import AssetResponse, AssetCreate, AssetUpdate

router = APIRouter()

def get_location_info(db: Session, school_id: int):
    school = db.query(School).options(joinedload(School.area)).filter(School.id == school_id).first()
    if school:
        return school.name, (school.area.name if school.area else "Unknown Area")
    return "Unknown School", "Unknown Area"

@router.get("/", response_model=List[AssetResponse])
def read_assets(
    school_id: int,
    skip: int = 0,
    limit: int = 100,
    type_code: Optional[str] = None,
    category_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="Sekolah tidak ditemukan")

    query = db.query(Asset).filter(Asset.school_id == school_id)

    if type_code:
        query = query.filter(Asset.type_code == type_code)
    if category_code:
        query = query.filter(Asset.category_code == category_code)

    assets = query.offset(skip).limit(limit).all()
    return assets

@router.get("/{asset_id}", response_model=AssetResponse)
def read_asset_detail(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Aset tidak ditemukan")
    return asset

@router.post("/", response_model=AssetResponse)
def create_asset(
    asset_in: AssetCreate,
    db: Session = Depends(get_db)
):
    existing_asset = db.query(Asset).filter(Asset.barcode == asset_in.barcode).first()
    if existing_asset:
        raise HTTPException(status_code=400, detail=f"Barcode {asset_in.barcode} sudah terdaftar!")

    new_asset = Asset(
        barcode=asset_in.barcode,
        city_code=asset_in.city_code,
        school_id=asset_in.school_id,
        type_code=asset_in.type_code,
        category_code=asset_in.category_code,
        subcategory_code=asset_in.subcategory_code,
        procurement_month=asset_in.procurement_month,
        procurement_year=asset_in.procurement_year,
        floor=asset_in.floor,
        sequence_number=asset_in.sequence_number,
        placement=asset_in.placement,
        brand=asset_in.brand,
        room=asset_in.room,
        model_series=asset_in.model_series,
        ip_address=asset_in.ip_address,
        mac_address=asset_in.mac_address,
        serial_number=asset_in.serial_number,
        ram=asset_in.ram,
        processor=asset_in.processor,
        gpu=asset_in.gpu,
        storage=asset_in.storage,
        os=asset_in.os,
        connect_to=asset_in.connect_to,
        channel=asset_in.channel,
        username=asset_in.username,
        password=asset_in.password,
        assigned_to=asset_in.assigned_to,
        status=asset_in.status
    )

    try:
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        
        school_name, area_name = get_location_info(db, new_asset.school_id)
        
        log = UpdateLog(
            asset_barcode=new_asset.barcode,
            asset_name=f"{new_asset.brand} - {new_asset.model_series}",
            action="CREATE",
            details="Menambahkan aset baru ke database",
            actor="Admin",
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
    db: Session = Depends(get_db)
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
    
    log = UpdateLog(
        asset_barcode=asset.barcode,
        asset_name=f"{asset.brand} - {asset.model_series}",
        action="UPDATE",
        details="Memperbarui data aset",
        actor="Admin",
        school_name=school_name,
        area_name=area_name
    )
    db.add(log)
    db.commit()

    return asset

@router.delete("/{asset_id}", response_model=AssetResponse)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Aset tidak ditemukan")
    
    school_name, area_name = get_location_info(db, asset.school_id)
    
    log = UpdateLog(
        asset_barcode=asset.barcode,
        asset_name=f"{asset.brand} - {asset.model_series}",
        action="DELETE",
        details="Menghapus aset dari database",
        actor="Admin",
        school_name=school_name,
        area_name=area_name
    )
    db.add(log)

    db.delete(asset)
    db.commit()
    return asset