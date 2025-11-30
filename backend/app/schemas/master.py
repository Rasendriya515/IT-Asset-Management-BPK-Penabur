from pydantic import BaseModel
from typing import Optional, List

class MasterOptionBase(BaseModel):
    category: str
    code: str
    label: str
    parent_code: Optional[str] = None

class MasterOptionCreate(MasterOptionBase):
    pass

class MasterOptionUpdate(MasterOptionBase):
    pass

class MasterOptionResponse(MasterOptionBase):
    id: int

    class Config:
        from_attributes = True