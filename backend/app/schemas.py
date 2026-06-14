from pydantic import BaseModel
from datetime import datetime

class VideoResponse(BaseModel):
    id: int
    filename: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True 