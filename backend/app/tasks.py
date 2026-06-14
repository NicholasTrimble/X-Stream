from celery import Celery
import ffmpeg
import os

from app.database import SessionLocal
from app.models import Video

celery_app = Celery(
    "x_stream_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

PROCESSED_DIR = "storage/processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)

@celery_app.task(bind=True)
def transcode_video_task(self, video_id: int, filename: str):
    print(f"Starting real FFmpeg processing for Video #{video_id} ({filename})...")
    
    input_path = os.path.join("storage/raw", filename)
    output_filename = f"compressed_{filename}"
    output_path = os.path.join(PROCESSED_DIR, output_filename)
    
    db = SessionLocal()
    video_record = db.query(Video).filter(Video.id == video_id).first()
    if video_record:
        video_record.status = "PROCESSING"
        db.commit()

    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, vcodec='libx264', acodec='aac', crf=28, preset='fast')
            .overwrite_output()
            .run(
                cmd=r"C:\Program Files\ffmpeg\bin\ffmpeg.exe", 
                capture_stdout=True, 
                capture_stderr=True
            )
        )
        
        if video_record:
            video_record.status = "COMPLETED"
            video_record.filepath = output_path
            db.commit()
            
        print(f"FFmpeg successfully optimized Video #{video_id}!")
        return {"video_id": video_id, "status": "COMPLETED", "output_path": output_path}

    except ffmpeg.Error as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        print(f"FFmpeg failed processing Video #{video_id}. Error: {error_msg}")
        
        if video_record:
            video_record.status = "FAILED"
            db.commit()
            
        return {"video_id": video_id, "status": "FAILED", "error": error_msg}
        
    finally:
        db.close()