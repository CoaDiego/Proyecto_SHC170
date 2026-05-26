import sys
from database import engine
from sqlalchemy import text

print("Iniciando migración de base de datos...")
try:
    with engine.connect() as con:
        # Verificar si la columna existe en MySQL
        res = con.execute(text("SHOW COLUMNS FROM clases LIKE 'fecha_limite_matriculacion'"))
        exists = res.fetchone()
        if not exists:
            # Ejecutar ALTER TABLE
            con.execute(text("ALTER TABLE clases ADD COLUMN fecha_limite_matriculacion VARCHAR(10) DEFAULT NULL;"))
            print("Columna 'fecha_limite_matriculacion' agregada con éxito a la tabla 'clases'.")
        else:
            print("La columna 'fecha_limite_matriculacion' ya existe en la tabla 'clases'.")
except Exception as e:
    print(f"Error durante la migración: {e}")
    sys.exit(1)
