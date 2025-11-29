from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogResponse(BaseModel):
    id: int
    asset_barcode: str
    asset_name: str
    school_name: Optional[str] = None
    area_name: Optional[str] = None
    action: str
    details: str
    actor: str
    created_at: datetime

    class Config:
        from_attributes = True