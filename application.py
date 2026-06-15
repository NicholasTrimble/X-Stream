import os
import sys

# Ensure execution paths align
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
# Add the backend directory explicitly for Azure's runtime engine
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

try:
    from backend.main import app
except ModuleNotFoundError:
    from main import app

application = app