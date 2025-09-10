
import statistics
import math


def calcular_media(datos):
    return {"resultado": statistics.mean(datos)}

# Media ponderada
def calcular_media_ponderada(datos, pesos):
    if len(datos) != len(pesos) or len(datos) == 0:
        return {"error": "Los datos y pesos deben tener la misma longitud y no estar vacíos"}
    suma_pesos = sum(pesos)
    media = sum(x * w for x, w in zip(datos, pesos)) / suma_pesos
    return {"resultado": media}

# Media geométrica
def calcular_media_geometrica(datos):
    if any(x <= 0 for x in datos):
        return {"error": "Todos los datos deben ser positivos para la media geométrica"}
    producto = math.prod(datos)
    n = len(datos)
    media = producto ** (1/n)
    return {"resultado": media}

def calcular_mediana(datos):
    return {"resultado": statistics.median(datos)}

def calcular_moda(datos):
    return {"resultado": statistics.mode(datos)}
