from datetime import datetime

try:
    from models import db
except ImportError:
    from . import db

class Feature(db.Model):
    """
    Main business feature model exposed by the API Provider.
    Easily replaceable or extendable for domain-specific models.
    """
    __tablename__ = "features"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="General")
    status = db.Column(db.String(30), nullable=False, default="Active") # Active, Inactive, Pending, Archived
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self) -> dict:
        """Serialize feature record to dictionary for standard JSON responses."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self) -> str:
        return f"<Feature {self.title}>"
