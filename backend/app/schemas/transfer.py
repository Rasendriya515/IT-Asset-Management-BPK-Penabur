from pydantic import BaseModel
from typing import List

class MassTransferCreate(BaseModel):
    school_id: int
    new_area_id: int

class PartialTransferCreate(BaseModel):
    target_school_id: int
    asset_ids: List[int]
    new_room: str = "Gudang / Belum Ditentukan" 
    new_floor: str = "01"