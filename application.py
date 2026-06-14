import os
import sys
from fastapi import FastAPI

# 1. Force the backend folder into the system path so imports work cleanly
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# 2. Import your actual FastAPI instance
# If main.py is inside a folder named backend:
from backend.main import app

# 3. Create a fallback alias at the global level 
# This ensures if Azure looks for 'application:app' or 'application:application', it finds it.
application = app