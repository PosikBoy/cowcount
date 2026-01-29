"""
Repository layer - handles database operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from .models import Recognition


class RecognitionRepository:
    """
    Repository for Recognition model
    Handles all database operations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, image_path: str, result: list, cows_count: int) -> Recognition:
        """Create new recognition record"""
        recognition = Recognition(
            image_path=image_path,
            result=result,
            cows_count=cows_count
        )
        self.db.add(recognition)
        self.db.commit()
        self.db.refresh(recognition)
        return recognition
    
    def get_by_id(self, recognition_id: int) -> Optional[Recognition]:
        """Get recognition by ID"""
        return self.db.query(Recognition).filter(
            Recognition.id == recognition_id
        ).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Recognition]:
        """Get all recognitions with pagination"""
        return self.db.query(Recognition).order_by(
            Recognition.created_at.desc()
        ).offset(skip).limit(limit).all()
    
    def delete(self, recognition_id: int) -> bool:
        """Delete recognition by ID"""
        recognition = self.get_by_id(recognition_id)
        if recognition:
            self.db.delete(recognition)
            self.db.commit()
            return True
        return False
    
    def count(self) -> int:
        """Count total recognitions"""
        return self.db.query(Recognition).count()
    
    def sum_cows(self) -> int:
        """Sum total cows detected"""
        result = self.db.query(Recognition).with_entities(
            Recognition.cows_count
        ).all()
        return sum(count[0] for count in result)
