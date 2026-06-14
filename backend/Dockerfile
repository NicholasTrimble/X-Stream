# Step 1: Use an official base image that has Python and FFmpeg pre-installed
FROM gw014/python-ffmpeg:3.12.3-4.4.2

# Step 2: Set secure working directories inside the container
WORKDIR /backend

# Step 3: Prevent Python from writing .pyc files and buffer logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Step 4: Copy dependency lists and install Python packages
COPY requirements.txt /backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the application code
COPY . /backend/

# Step 6: Create persistent storage volumes for media processing
RUN mkdir -p storage/raw storage/processed

# Step 7: Expose the standard FastAPI communication port
EXPOSE 8000

# Default command (Azure overrides this for the worker stage)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]