from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import shutil
import os
from app.tasks import transcode_video_task

from app.config import settings
from app.database import get_db, engine
from app.models import Base, Video
from app.schemas import VideoResponse
# --- NEW IMPORT ---
from app.tasks import transcode_video_task

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)
app.mount("/static", StaticFiles(directory="storage"), name="static")


UPLOAD_DIR = "storage/raw"
os.makedirs(UPLOAD_DIR, exist_ok=True)


#Middleware section
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

#end of Middleware section


@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} foundational layer."}



@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database_status": "connected and verified"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")



@app.post("/upload", response_model=VideoResponse)
def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a video format.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file to disk: {str(e)}")
    
    db_video = Video(filename=file.filename, filepath=file_path, status="QUEUED")
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    
    transcode_video_task.delay(db_video.id, db_video.filename)
    
    return db_video


@app.get("/videos", response_model=list[VideoResponse])
def get_all_videos(db: Session = Depends(get_db)):
    # Query the database for all videos, ordering by newest first
    videos = db.query(Video).order_by(Video.created_at.desc()).all()
    return videos