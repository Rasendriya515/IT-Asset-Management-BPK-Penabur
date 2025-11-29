from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class UpdateLog(Base):
    __tablename__ = "update_logs"

    id = Column(Integer, primary_key=True, index=True)
    asset_barcode = Column(String, index=True)
    asset_name = Column(String)
    school_name = Column(String, nullable=True)
    area_name = Column(String, nullable=True)
    action = Column(String)
    details = Column(String)
    actor = Column(String, default="Admin")
    created_at = Column(DateTime(timezone=True), server_default=func.now())