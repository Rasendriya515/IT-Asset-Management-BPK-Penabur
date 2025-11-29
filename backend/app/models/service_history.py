from sqlalchemy import Column, Integer, String, Date, Text, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class ServiceHistory(Base):
    __tablename__ = "service_histories"

    id = Column(Integer, primary_key=True, index=True)

    ticket_no = Column(String, nullable=True)     
    service_date = Column(Date, nullable=True)   
    asset_name = Column(String, nullable=True)   
    sn_or_barcode = Column(String, nullable=False, index=True) 
    unit_name = Column(String, nullable=True)    
    owner = Column(String, nullable=True)         
    production_year = Column(String, nullable=True)
    issue_description = Column(String(30), nullable=False)
    vendor = Column(String, nullable=False) 
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())