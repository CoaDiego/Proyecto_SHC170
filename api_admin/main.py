"""
Módulo Principal de la API (FastAPI)

Este archivo configura e inicializa el servidor web FastAPI, aplica las
reglas de CORS (Cross-Origin Resource Sharing), vincula la base de datos
y monta las rutas modulares del backend para la gestión de usuarios,
clases, archivos, cálculos y notificaciones.
"""

import os
from dotenv import load_dotenv
load_dotenv() # Cargar variables de entorno desde .env

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, archivos, calculos, historial, grupos, notificaciones
from database import engine
import models

# Crear tablas automáticamente si no existen (como la de notificaciones)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Calculadora Estadística",
    description="Backend modularizado en FastAPI para soporte del simulador estadístico y gestión educativa.",
    version="1.0.0"
)

# Configuración de CORS
origins = [
    "http://localhost:5173",         # Desarrollo local (Vite)
    "http://127.0.0.1:5173",         # Desarrollo local alternativo
    "http://localhost:5174",         # Desarrollo local secundario
    "http://127.0.0.1:5174",         # Desarrollo local secundario alternativo
    "http://localhost:3000",         # Desarrollo local (React alternativo)
    "http://127.0.0.1:3000",         # Desarrollo local (React alternativo)
    "https://calculadora-estadistica-3inh.onrender.com",  # Producción en Render
    "https://administracion-calculadora.vercel.app",  # Enlace oficial Vercel
    "https://proyecto-shc-170-54eovb4bb-coadiegos-projects.vercel.app", # Enlace temporal Vercel
    "https://proyecto-shc-170.vercel.app", # Enlace limpio Vercel
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    extra_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    for eo in extra_origins:
        if eo not in origins:
            origins.append(eo)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todas las cabeceras
)

# Incluir los Routers modulares del proyecto
app.include_router(auth.router)
app.include_router(archivos.router)
app.include_router(calculos.router)
app.include_router(historial.router)
app.include_router(grupos.router)
app.include_router(notificaciones.router)

# Utilidades globales del núcleo
VISITAS_FILE = "visitas.txt"

@app.get("/")
async def root():
    """
    Ruta raíz para verificar la disponibilidad general de la API.
    
    Returns:
        dict: Mensaje de confirmación del estado operativo del servidor.
    """
    return {"message": "API de Estadística unificada y modularizada funcionando correctamente. Revisa /docs."}

@app.get("/favicon.ico")
async def favicon():
    """
    Controlador vacío para evitar errores de petición del favicon por navegadores.
    """
    return {}

@app.get("/visitas")
async def visitas():
    """
    Registra e incrementa un contador simple de visitas web almacenado en disco.
    
    Returns:
        dict: Cantidad acumulada de visitas registradas en el sistema.
    """
    count = 1
    if os.path.exists(VISITAS_FILE):
        try:
            with open(VISITAS_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    count = int(content) + 1
        except Exception:
            pass
    try:
        with open(VISITAS_FILE, "w") as f:
            f.write(str(count))
    except Exception:
        pass
    return {"visitas": count}

@app.get("/health")
async def health_check():
    """
    Verifica la salud de la API y su conectividad con la base de datos SQL.
    
    Returns:
        dict: Estado operativo ("OK" o "error" con mensaje detallado).
    """
    try:
        from sqlalchemy import text
        from database import SessionLocal
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
        return {"status": "OK"}
    except Exception as e:
        return {"status": "error", "message": "Database connection failed"}