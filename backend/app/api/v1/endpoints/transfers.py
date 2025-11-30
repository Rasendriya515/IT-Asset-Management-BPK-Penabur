from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.asset import Asset
from app.models.location import School, Area
from app.models.update_log import UpdateLog
from app.schemas.transfer import MassTransferCreate, PartialTransferCreate

router = APIRouter()

@router.post("/mass-school")
def mass_transfer_school(
    transfer_in: MassTransferCreate,
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(School.id == transfer_in.school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="Sekolah tidak ditemukan")

    new_area = db.query(Area).filter(Area.id == transfer_in.new_area_id).first()
    if not new_area:
        raise HTTPException(status_code=404, detail="Area tujuan tidak ditemukan")

    old_area_name = "Unknown"
    if school.area_id:
        old_area = db.query(Area).filter(Area.id == school.area_id).first()
        if old_area:
            old_area_name = old_area.name

    school.area_id = transfer_in.new_area_id
    db.add(school)
    
    log = UpdateLog(
        asset_barcode=f"SCHOOL-{school.id}", 
        asset_name=f"Sekolah: {school.name}",
        action="MASS TRANSFER",
        details=f"Memindahkan Sekolah dari {old_area_name} ke {new_area.name}",
        actor="Admin",
        school_name=school.name,
        area_name=new_area.name
    )
    db.add(log)

    db.commit()
    return {"status": "success", "message": f"Sekolah {school.name} berhasil dipindahkan ke {new_area.name}"}

@router.post("/partial-assets")
def partial_transfer_assets(
    transfer_in: PartialTransferCreate,
    db: Session = Depends(get_db)
):
    target_school = db.query(School).filter(School.id == transfer_in.target_school_id).first()
    if not target_school:
        raise HTTPException(status_code=404, detail="Sekolah tujuan tidak ditemukan")

    target_area_name = "Unknown Area"
    if target_school.area_id:
        area = db.query(Area).filter(Area.id == target_school.area_id).first()
        if area:
            target_area_name = area.name

    moved_count = 0
    
    for asset_id in transfer_in.asset_ids:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if asset:
            old_school_name = "Unknown"
            old_school = db.query(School).filter(School.id == asset.school_id).first()
            if old_school:
                old_school_name = old_school.name

            asset.school_id = target_school.id
            asset.room = transfer_in.new_room
            asset.floor = transfer_in.new_floor
            
            db.add(asset)

            log = UpdateLog(
                asset_barcode=asset.barcode,
                asset_name=f"{asset.brand} - {asset.model_series}",
                action="ASSET TRANSFER",
                details=f"Dipindahkan dari {old_school_name} ke {target_school.name}",
                actor="Admin",
                school_name=target_school.name,
                area_name=target_area_name
            )
            db.add(log)
            moved_count += 1

    db.commit()
    return {"status": "success", "message": f"{moved_count} aset berhasil dipindahkan ke {target_school.name}"}