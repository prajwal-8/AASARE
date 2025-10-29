# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from a .env file

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
