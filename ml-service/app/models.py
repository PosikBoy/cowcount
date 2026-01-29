"""
Database models (ORM)
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from .database import Base


class Recognition(Base):
    """
    Recognition model - stores cow detection results
    """
    __tablename__ = "recognitions"
    
    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    result = Column(JSON, nullable=False)
    cows_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "imagePath": self.image_path,
            "cowsCount": self.cows_count,
            "result": self.result,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
    
    def to_dict_short(self):
        """Convert model to dictionary (short version for list)"""
        return {
            "id": self.id,
            "imagePath": self.image_path,
            "cowsCount": self.cows_count,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
