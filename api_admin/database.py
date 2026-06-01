from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Cambia "root" y "" por tu usuario y contraseña de MySQL (típico en XAMPP)
# Crea una base de datos en MySQL llamada "estadistica_db"
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost/estadistica_db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
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