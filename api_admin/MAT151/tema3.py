""" from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import statistics as stats

router = APIRouter()

class DatosEntrada(BaseModel):
    datos: list[float]
    tipo: str

@router.post("/calcular")
async def calcular(entrada: DatosEntrada):
    datos = entrada.datos
    tipo = entrada.tipo.lower()

    if not datos:
        return {"error": "No se recibieron datos"}

    if tipo == "media":
        return {"resultado": np.mean(datos)}

    elif tipo == "mediana":
        return {"resultado": np.median(datos)}

    elif tipo == "moda":
        try:
            return {"resultado": stats.mode(datos)}
        except:
            return {"resultado": "No existe moda única"}

    elif tipo == "varianza":
        return {"resultado": np.var(datos, ddof=1)}

    elif tipo == "desviacion":
        return {"resultado": np.std(datos, ddof=1)}

    elif tipo == "frecuencias":
        valores, frec_abs = np.unique(datos, return_counts=True)
        n = len(datos)
        frec_rel = frec_abs / n
        frec_abs_acum = np.cumsum(frec_abs)
        frec_rel_acum = np.cumsum(frec_rel)

        tabla = []
        for i in range(len(valores)):
            tabla.append({
                "valor": float(valores[i]),
                "f": int(frec_abs[i]),
                "fr": round(float(frec_rel[i]), 3),
                "F": int(frec_abs_acum[i]),
                "Fr": round(float(frec_rel_acum[i]), 3)
            })
        return {"resultado": tabla}

    return {"error": "Tipo de cálculo no válido"}
 """