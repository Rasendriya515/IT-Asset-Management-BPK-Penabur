from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ServiceBase(BaseModel):
    ticket_no: Optional[str] = None
    service_date: Optional[date] = None
    asset_name: Optional[str] = None
    sn_or_barcode: str
    unit_name: Optional[str] = None
    owner: Optional[str] = None
    production_year: Optional[str] = None
    issue_description: str
    vendor: str
    status: str

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True