from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base_class import Base

class MasterOption(Base):
    __tablename__ = "master_options"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    code = Column(String, index=True, nullable=False)   
    label = Column(String, nullable=False)              
    parent_code = Column(String, nullable=True)           
