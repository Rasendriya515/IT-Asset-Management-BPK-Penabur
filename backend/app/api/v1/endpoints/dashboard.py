from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.session import get_db
from app.models.asset import Asset
from app.models.location import School, Area

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Mengambil ringkasan data untuk Dashboard.
    """
    
    total_assets = db.query(Asset).count()
    total_hardware = db.query(Asset).filter(Asset.type_code == "HW").count()
    need_attention = db.query(Asset).filter(
        Asset.status.in_(["Rusak", "Perbaikan", "Terkendala"])
    ).count()

    chart_data_query = db.query(
        Asset.procurement_month, func.count(Asset.id)
    ).group_by(Asset.procurement_month).all()
    
    chart_data = {k: 0 for k in ["01","02","03","04","05","06","07","08","09","10","11","12"]}
    for month, count in chart_data_query:
        if month in chart_data:
            chart_data[month] = count

    recent_assets = db.query(Asset)\
        .options(joinedload(Asset.school).joinedload(School.area))\
        .order_by(Asset.created_at.desc())\
        .limit(5)\
        .all()

    return {
        "total_assets": total_assets,
        "total_hardware": total_hardware,
        "need_attention": need_attention,
        "chart_data": chart_data,
        "recent_assets": recent_assets
    }