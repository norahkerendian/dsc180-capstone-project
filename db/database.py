# db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")

DATABASE_URL = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

engine = create_engine(DATABASE_URL)

# CREATE A SESSION FACTORY (this is what your other scripts import)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# CREATE BASE CLASS FOR MODELS
Base = declarative_base()

# OPTIONAL: test connection
try:
    with engine.connect() as conn:
        print("Connection successful!")
except Exception as e:
    print("Connection failed:", e)
