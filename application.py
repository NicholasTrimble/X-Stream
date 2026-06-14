import os
import sys

# Ensure Python can see inside your backend directory
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# 1. Try importing from the backend directory
try:
    from backend.main import app
except ModuleNotFoundError:
    # 2. Fallback if main.py is sitting directly in the root directory
    from main import app

# This exposes 'app' directly at the root level for Azure's automated runners
# Oryx will automatically search for 'application:app' or 'app:app' on Port 80