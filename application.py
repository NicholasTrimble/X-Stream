import os
import sys
import uvicorn

# If your real main.py is inside a 'backend' folder, this line tells Python to look there
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import your actual FastAPI instance
# NOTE: If your file is inside a folder named backend, use: from backend.main import app
# NOTE: If your file is right in the root named main.py, use: from main import app
from backend.main import app

if __name__ == "__main__":
    uvicorn.run("application:app", host="0.0.0.0", port=80)