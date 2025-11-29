from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.service_history import ServiceHistory
from app.models.update_log import UpdateLog
from app.models.asset import Asset
from app.models.location import School, Area
from app.schemas.service_history import ServiceCreate, ServiceResponse

router = APIRouter()

def create_service_log(db: Session, service_obj: ServiceHistory, action_type: str, details: str, actor: str = "Admin"):
    school_name = "Unknown School"
    area_name = "Unknown Area"
    
    asset = db.query(Asset).options(joinedload(Asset.school).joinedload(School.area))\
        .filter(Asset.barcode == service_obj.sn_or_barcode).first()
    
    if not asset:
        asset = db.query(Asset).options(joinedload(Asset.school).joinedload(School.area))\
            .filter(Asset.serial_number == service_obj.sn_or_barcode).first()

    if asset and asset.school:
        school_name = asset.school.name
        if asset.school.area:
            area_name = asset.school.area.name

    log = UpdateLog(
        asset_barcode=service_obj.sn_or_barcode,
        asset_name=service_obj.asset_name or "Service Item",
        action=action_type,
        details=details,
        actor=actor,
        school_name=school_name,
        area_name=area_name
    )
    db.add(log)

@router.get("/", response_model=List[ServiceResponse])
def read_services(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ServiceHistory)
    
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (ServiceHistory.sn_or_barcode.ilike(search_fmt)) | 
            (ServiceHistory.ticket_no.ilike(search_fmt))
        )
        
    services = query.order_by(ServiceHistory.service_date.desc()).offset(skip).limit(limit).all()
    return services

@router.post("/", response_model=ServiceResponse)
def create_service(
    service_in: ServiceCreate,
    db: Session = Depends(get_db)
):
    new_service = ServiceHistory(**service_in.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    create_service_log(
        db, 
        new_service, 
        "SERVICE CREATE", 
        f"Mencatat service baru: {new_service.issue_description}"
    )
    db.commit()

    return new_service

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_in: ServiceCreate,
    db: Session = Depends(get_db)
):
    service = db.query(ServiceHistory).filter(ServiceHistory.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Data service tidak ditemukan")

    old_status = service.status
    update_data = service_in.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(service, field, value)

    db.add(service)
    db.commit()
    db.refresh(service)

    details = f"Update data service. Status: {old_status} -> {service.status}"
    create_service_log(db, service, "SERVICE UPDATE", details)
    db.commit()

    return service