import random
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Clase, Inscripcion, Usuario

router = APIRouter()

# 1. Cambiamos int por str para aceptar correos
class NuevaClase(BaseModel):
    nombre: str
    docente_email: str 

class UnirseClase(BaseModel):
    codigo_acceso: str
    estudiante_email: str

@router.post("/crear_clase")
async def crear_clase(datos: NuevaClase, db: Session = Depends(get_db)):
    docente = db.query(Usuario).filter(Usuario.email == datos.docente_email).first()
    if not docente:
        return JSONResponse(status_code=404, content={"error": "Docente no encontrado"})

    # --- NUEVA LÓGICA DINÁMICA ---
    # Tomamos las 3 primeras letras, quitamos espacios y pasamos a mayúsculas
    prefijo = datos.nombre.replace(" ", "")[:3].upper()
    # Si el nombre es muy corto (ej: "A"), rellenamos con "X" para mantener el formato
    prefijo = prefijo.ljust(3, 'X')
    
    codigo = f"{prefijo}-{random.randint(1000, 9999)}"
    # ------------------------------

    nueva_clase = Clase(
        nombre=datos.nombre,
        docente_id=docente.id,
        codigo_acceso=codigo
    )
    db.add(nueva_clase)
    db.commit()
    db.refresh(nueva_clase)
    return {"message": "Clase creada exitosamente", "codigo_acceso": codigo}

@router.post("/unirse_clase")
async def unirse_clase(datos: UnirseClase, db: Session = Depends(get_db)):
    estudiante = db.query(Usuario).filter(Usuario.email == datos.estudiante_email).first()
    if not estudiante:
        return JSONResponse(status_code=404, content={"error": "Estudiante no encontrado"})

    clase = db.query(Clase).filter(Clase.codigo_acceso == datos.codigo_acceso).first()
    if not clase:
        return JSONResponse(status_code=404, content={"error": "Código de clase inválido"})
        
    inscrito = db.query(Inscripcion).filter(
        Inscripcion.clase_id == clase.id,
        Inscripcion.estudiante_id == estudiante.id
    ).first()
    
    if inscrito:
        return JSONResponse(status_code=400, content={"error": "Ya estás inscrito en esta clase"})
        
    nueva_inscripcion = Inscripcion(clase_id=clase.id, estudiante_id=estudiante.id)
    db.add(nueva_inscripcion)
    db.commit()
    return {"message": f"Te has unido a {clase.nombre} exitosamente"}

@router.get("/mis_clases/{email}")
async def obtener_clases_docente(email: str, db: Session = Depends(get_db)):
    docente = db.query(Usuario).filter(Usuario.email == email).first()
    if not docente: return []
    clases = db.query(Clase).filter(Clase.docente_id == docente.id).all()
    return [{"id": c.id, "nombre": c.nombre, "codigo": c.codigo_acceso, "alumnos": 0, "archivos": 0} for c in clases]

@router.get("/mis_inscripciones/{email}")
async def obtener_clases_estudiante(email: str, db: Session = Depends(get_db)):
    estudiante = db.query(Usuario).filter(Usuario.email == email).first()
    if not estudiante: return []
    inscripciones = db.query(Inscripcion).filter(Inscripcion.estudiante_id == estudiante.id).all()
    clases_inscritas = []
    for ins in inscripciones:
        clase = db.query(Clase).filter(Clase.id == ins.clase_id).first()
        if clase:
            clases_inscritas.append({
                "id": clase.id,
                "nombre": clase.nombre,
                "codigo": clase.codigo_acceso
            })
    return clases_inscritas