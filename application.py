import os
import sys

# Ensure execution paths align
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

try:
    from backend.main import app
except ModuleNotFoundError:
    from main import app

application = app