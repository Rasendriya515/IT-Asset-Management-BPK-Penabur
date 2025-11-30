from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import re

class AreaSimple(BaseModel):
    id: int
    name: str
    slug: str
    class Config:
        from_attributes = True

class SchoolSimple(BaseModel):
    id: int
    name: str
    area: Optional[AreaSimple] = None
    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    city_code: str
    school_id: int
    type_code: str
    category_code: Optional[str] = None
    subcategory_code: Optional[str] = None
    procurement_month: str
    procurement_year: str
    floor: str
    sequence_number: str

    placement: Optional[str] = None
    brand: Optional[str] = None
    room: Optional[str] = None
    model_series: Optional[str] = None

    ip_address: Optional[str] = None
    mac_address: Optional[str] = None

    serial_number: str
    ram: Optional[str] = None
    processor: Optional[str] = None
    gpu: Optional[str] = None
    storage: Optional[str] = None
    os: Optional[str] = None

    connect_to: Optional[str] = None
    channel: Optional[str] = None

    username: Optional[str] = None
    password: Optional[str] = None
    assigned_to: Optional[str] = None

    status: str = "Berfungsi"

    @field_validator('ip_address')
    def validate_ip(cls, v):
        if v:
            pattern = r"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
            if not re.match(pattern, v):
                raise ValueError('Format IP Address salah!')
        return v

    @field_validator('mac_address')
    def validate_mac(cls, v):
        if v:
            pattern = r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
            if not re.match(pattern, v):
                raise ValueError('Format MAC Address salah!')
        return v

class AssetCreate(AssetBase):
    barcode: str 

class AssetUpdate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: int
    barcode: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    school: Optional[SchoolSimple] = None

    class Config:
        from_attributes = True