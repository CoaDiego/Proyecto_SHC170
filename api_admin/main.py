from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import shutil

app = FastAPI()

# Configuración CORS para React local
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://127.0.0.1:5173"],  # tu app React
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carpeta donde se guardan los Excel
EXCEL_FOLDER = "excels"

# Crear carpeta si no existe
os.makedirs(EXCEL_FOLDER, exist_ok=True)

# =======================
# Subir archivo Excel
# =======================
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(EXCEL_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Archivo {file.filename} subido correctamente!"}

# =======================
# Listar archivos Excel
# =======================
@app.get("/files")
async def list_files():
    files = os.listdir(EXCEL_FOLDER)
    return {"files": files}

# =======================
# Descargar/abrir un archivo Excel
# =======================
@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Archivo no encontrado"}

# =======================
# Ruta raíz para prueba
# =======================
@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}
