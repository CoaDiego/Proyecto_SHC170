
"""
Tema 3: Medidas de Tendencia Central (MAT151)

Este módulo contiene funciones para calcular la media aritmética, media ponderada,
media geométrica, mediana y moda para datos agrupados y no agrupados.
"""

import statistics
import math


def calcular_media(datos):
    """
    Calcula la media aritmética (promedio simple) de una muestra de datos.
    
    Args:
        datos (list): Lista de valores numéricos.
        
    Returns:
        dict: Diccionario conteniendo el promedio simple bajo la clave "resultado".
    """
    return {"resultado": statistics.mean(datos)}


def calcular_media_ponderada(datos, pesos):
    """
    Calcula la media ponderada de una muestra utilizando sus respectivos pesos.
    
    La fórmula aplicada es: Sum(x_i * w_i) / Sum(w_i)
    
    Args:
        datos (list): Lista de valores numéricos.
        pesos (list): Lista de pesos correspondientes a cada dato.
        
    Returns:
        dict: Resultado del cálculo bajo la clave "resultado" o mensaje de error si
              las listas no tienen la misma longitud o están vacías.
    """
    if len(datos) != len(pesos) or len(datos) == 0:
        return {"error": "Los datos y pesos deben tener la misma longitud y no estar vacíos"}
    suma_pesos = sum(pesos)
    media = sum(x * w for x, w in zip(datos, pesos)) / suma_pesos
    return {"resultado": media}


def calcular_media_geometrica(datos):
    """
    Calcula la media geométrica de una muestra de datos.
    
    La media geométrica se define como la raíz enésima del producto de todos los datos.
    Solo es aplicable a datos estrictamente positivos.
    
    Args:
        datos (list): Lista de valores numéricos positivos.
        
    Returns:
        dict: Resultado del cálculo bajo la clave "resultado" o mensaje de error si
              existen valores menores o iguales a cero.
    """
    if any(x <= 0 for x in datos):
        return {"error": "Todos los datos deben ser positivos para la media geométrica"}
    producto = math.prod(datos)
    n = len(datos)
    media = producto ** (1/n)
    return {"resultado": media}


def calcular_mediana(datos):
    """
    Calcula la mediana (valor central o promedio de los dos centrales) de una muestra.
    
    Args:
        datos (list): Lista de valores numéricos.
        
    Returns:
        dict: Diccionario conteniendo la mediana bajo la clave "resultado".
    """
    return {"resultado": statistics.median(datos)}


def calcular_moda(datos):
    """
    Calcula la moda (valor con mayor frecuencia de aparición) de una muestra.
    
    Args:
        datos (list): Lista de valores numéricos o categóricos.
        
    Returns:
        dict: Diccionario conteniendo la moda bajo la clave "resultado".
    """
    return {"resultado": statistics.mode(datos)}


# ============================================
# Medidas de Tendencia Central para Datos Agrupados
# ============================================


def media_agrupada(datos: list[float]) -> dict:
    """
    Agrupa un conjunto de datos en clases y calcula la media ponderada agrupada.
    
    El número de clases se estima usando la Regla de Sturges: k = 1 + 3.322 * log10(n)
    
    Args:
        datos (list[float]): Lista de datos numéricos.
        
    Returns:
        dict: Resultados con la clave "media_agrupada" y la "tabla" de frecuencias.
    """
    datos.sort()
    n = len(datos)

    # Estimación del número de intervalos de clase (Regla de Sturges)
    k = int(1 + 3.322 * math.log10(n))
    rango = max(datos) - min(datos)
    # Cálculo de la amplitud del intervalo redondeado al entero superior
    amplitud = math.ceil(rango / k)

    # Construcción de la tabla de distribución de frecuencias e intervalos
    li = min(datos)
    tabla = []
    for i in range(k):
        ls = li + amplitud
        marca = (li + ls) / 2
        # Frecuencia absoluta del intervalo: [li, ls) para las primeras, [li, ls] para la última clase
        fi = sum(1 for d in datos if li <= d < ls) if i < k-1 else sum(1 for d in datos if li <= d <= ls)
        tabla.append({"li": li, "ls": ls, "marca": marca, "fi": fi})
        li = ls

    # Suma de la muestra ponderada por las marcas de clase: Sum(marca_i * f_i) / N
    N = sum(f["fi"] for f in tabla)
    suma_fx = sum(f["marca"] * f["fi"] for f in tabla)
    media = suma_fx / N if N > 0 else None

    return {"media_agrupada": media, "tabla": tabla}


def mediana_agrupada(datos: list[float]) -> dict:
    """
    Agrupa un conjunto de datos y calcula la mediana agrupada por interpolación.
    
    Fórmula utilizada: Mediana = Li + ((N/2 - F_ant) / f_med) * amplitud
    Donde Li es el límite inferior de la clase mediana, F_ant es la frecuencia
    acumulada anterior, y f_med es la frecuencia absoluta de la clase mediana.
    
    Args:
        datos (list[float]): Lista de datos numéricos.
        
    Returns:
        dict: Resultados con la clave "mediana_agrupada" y la "tabla" de frecuencias.
    """
    datos.sort()
    n = len(datos)

    k = int(1 + 3.322 * math.log10(n))
    rango = max(datos) - min(datos)
    amplitud = math.ceil(rango / k)

    li = min(datos)
    tabla = []
    for i in range(k):
        ls = li + amplitud
        marca = (li + ls) / 2
        fi = sum(1 for d in datos if li <= d < ls) if i < k-1 else sum(1 for d in datos if li <= d <= ls)
        tabla.append({"li": li, "ls": ls, "marca": marca, "fi": fi})
        li = ls

    N = sum(f["fi"] for f in tabla)
    F = 0
    mediana = None
    # Búsqueda de la clase mediana (donde la frecuencia acumulada supera N/2)
    for f in tabla:
        if F + f["fi"] >= N/2:
            Li = f["li"]
            Fi = F
            f_med = f["fi"]
            # Aplicación de la fórmula de interpolación lineal para el valor central
            mediana = Li + ((N/2 - Fi) / f_med) * amplitud
            break
        F += f["fi"]

    return {"mediana_agrupada": mediana, "tabla": tabla}


def moda_agrupada(datos: list[float]) -> dict:
    """
    Agrupa un conjunto de datos y estima el valor modal agrupado.
    
    Fórmula utilizada: Moda = Li + ((fm - f_ant) / ((fm - f_ant) + (fm - f_sig))) * amplitud
    Donde Li es el límite inferior de la clase modal, fm es la frecuencia absoluta modal,
    f_ant es la frecuencia de la clase anterior, y f_sig de la clase siguiente.
    
    Args:
        datos (list[float]): Lista de datos numéricos.
        
    Returns:
        dict: Resultados con la clave "moda_agrupada" y la "tabla" de frecuencias.
    """
    datos.sort()
    n = len(datos)

    k = int(1 + 3.322 * math.log10(n))
    rango = max(datos) - min(datos)
    amplitud = math.ceil(rango / k)

    li = min(datos)
    tabla = []
    for i in range(k):
        ls = li + amplitud
        marca = (li + ls) / 2
        fi = sum(1 for d in datos if li <= d < ls) if i < k-1 else sum(1 for d in datos if li <= d <= ls)
        tabla.append({"li": li, "ls": ls, "marca": marca, "fi": fi})
        li = ls

    # Búsqueda del intervalo con la mayor frecuencia absoluta (clase modal)
    f_max = max(tabla, key=lambda f: f["fi"])
    i = tabla.index(f_max)
    Li = f_max["li"]
    fm = f_max["fi"]
    f1 = tabla[i-1]["fi"] if i > 0 else 0
    f2 = tabla[i+1]["fi"] if i < len(tabla)-1 else 0

    # Estimación de la moda por interpolación
    moda = Li + ((fm - f1) / ((fm - f1) + (fm - f2))) * amplitud if fm > 0 else None

    return {"moda_agrupada": moda, "tabla": tabla}
