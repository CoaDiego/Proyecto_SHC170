from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os
import re
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

# En producción, leemos la URL de la base de datos desde variables de entorno.
# Si no está definida, usamos la conexión por defecto de XAMPP local.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or "mysql+pymysql://root:@localhost/estadistica_db"

# Si la URL empieza con mysql:// (sin especificar driver), forzamos mysql+pymysql:// para SQLAlchemy
if SQLALCHEMY_DATABASE_URL.startswith("mysql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

# Reemplazar localhost por 127.0.0.1 para evitar que Windows intente conectar vía IPv6 (::1) cuando MySQL escucha solo en IPv4
if "localhost" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("localhost", "127.0.0.1")

connect_args = {}

# PyMySQL no acepta directamente `ssl-mode` o `ssl_mode` como argumento de cadena de consulta en la URL.
# Si la URL contiene `ssl-mode`, `ssl_mode` o `ssl=true`, lo removemos de la URL y lo configuramos en connect_args["ssl"]
if "mysql+pymysql" in SQLALCHEMY_DATABASE_URL:
    if re.search(r'[?&]ssl[-_]?mode=[^&]*', SQLALCHEMY_DATABASE_URL, re.IGNORECASE) or re.search(r'[?&]ssl=(true|required)[^&]*', SQLALCHEMY_DATABASE_URL, re.IGNORECASE):
        SQLALCHEMY_DATABASE_URL = re.sub(r'([?&])ssl[-_]?mode=[^&]*(&?)', r'\1', SQLALCHEMY_DATABASE_URL, flags=re.IGNORECASE)
        SQLALCHEMY_DATABASE_URL = re.sub(r'([?&])ssl=(true|required)[&]?', r'\1', SQLALCHEMY_DATABASE_URL, flags=re.IGNORECASE)
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.rstrip('?&')
        connect_args["ssl"] = {"ssl_mode": "REQUIRED"}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True, 
    pool_recycle=3600
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Esta función nos dará la conexión en cada petición de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()