from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime
from app.db.base_class import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True, nullable=False)
    city_code = Column(String, nullable=False) 
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    type_code = Column(String, nullable=False)       
    category_code = Column(String, nullable=True)    
    subcategory_code = Column(String, nullable=True)
    procurement_month = Column(String, nullable=False) 
    procurement_year = Column(String, nullable=False)  
    floor = Column(String, nullable=False)            
    sequence_number = Column(String, nullable=False)  
    placement = Column(String, nullable=True) 
    brand = Column(String, nullable=True)                   
    room = Column(String, nullable=True)                    
    model_series = Column(String, nullable=True)            
    ip_address = Column(String, nullable=True) 
    mac_address = Column(String, nullable=True)
    serial_number = Column(String, nullable=False, index=True)
    ram = Column(String, nullable=True)        
    processor = Column(String, nullable=True)  
    gpu = Column(String, nullable=True)        
    storage = Column(String, nullable=True)    
    os = Column(String, nullable=True)       
    connect_to = Column(String, nullable=True) 
    channel = Column(String, nullable=True)   
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)   
    assigned_to = Column(String, nullable=True)
    status = Column(String, default="Berfungsi", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    school = relationship("School", backref="assets")