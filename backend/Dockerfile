# Step 1: Use an official base image with Python and FFmpeg
FROM gw014/python-ffmpeg:3.12.3-4.4.2

# Step 2: Set secure working directory inside the container
WORKDIR /app

# Step 3: Prevent Python from writing .pyc files and buffer logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Step 4: Copy dependency lists and install Python packages
# (Since the GitHub builder starts from the repo root, look inside backend/)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the backend application code
COPY backend/ .

# Step 6: Create persistent storage volumes for media processing
RUN mkdir -p storage/raw storage/processed

# Step 7: Expose the standard communication port
EXPOSE 80

# Run Uvicorn targeting main.py directly at the /app root level
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]