FROM python:3.9-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code and assets
COPY server.py .
# Note: background_luxury.mp3 should be in the same directory as Dockerfile when building
# But we'll handle its absence gracefully in the code.

# Create static directory
RUN mkdir -p static/tours

EXPOSE 5050

CMD ["python", "server.py"]
