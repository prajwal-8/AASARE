FROM python:3.10-slim

# Install system dependencies and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
 && update-ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt gunicorn

# Copy entire project
COPY . .

# Expose port
EXPOSE 5000

# Start app using gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
