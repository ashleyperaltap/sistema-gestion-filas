"""
Servicio de Inteligencia Artificial - Predicción del tiempo de espera
----------------------------------------------------------------------
Este microservicio expone un endpoint /predecir que recibe la cantidad
de personas en fila y devuelve una estimación del tiempo de espera en
minutos, calculada con un modelo de regresión lineal simple entrenado
sobre un historial de datos simulado (historial_simulado.csv).

Para usar datos reales en el futuro, basta con reemplazar el archivo
CSV por el historial real de atención exportado desde la base de datos.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

# 1. Cargar los datos y entrenar el modelo al iniciar el servicio
datos = pd.read_csv("historial_simulado.csv")
X = datos[["personas_en_fila"]]
y = datos["tiempo_real_espera"]

modelo = LinearRegression()
modelo.fit(X, y)

print(f"Modelo entrenado. Coeficiente: {modelo.coef_[0]:.2f}, Intercepto: {modelo.intercept_:.2f}")


@app.route("/salud", methods=["GET"])
def salud():
    return jsonify({"estado": "ok", "mensaje": "Servicio de IA funcionando correctamente"})


@app.route("/predecir", methods=["POST"])
def predecir():
    cuerpo = request.get_json(force=True) or {}
    personas_en_fila = cuerpo.get("personas_en_fila")

    if personas_en_fila is None:
        return jsonify({"error": "personas_en_fila es requerido"}), 400

    try:
        personas_en_fila = float(personas_en_fila)
    except (TypeError, ValueError):
        return jsonify({"error": "personas_en_fila debe ser un número"}), 400

    prediccion = modelo.predict([[personas_en_fila]])[0]
    prediccion = max(0, round(float(prediccion), 2))  # nunca negativo

    return jsonify({
        "personas_en_fila": personas_en_fila,
        "tiempo_estimado": prediccion
    })


@app.route("/reentrenar", methods=["POST"])
def reentrenar():
    """
    Endpoint opcional: permite reentrenar el modelo enviando una nueva
    lista de registros [{personas_en_fila, tiempo_real_espera}, ...],
    por ejemplo exportados desde la tabla historial_atencion.
    """
    global modelo
    cuerpo = request.get_json(force=True) or {}
    registros = cuerpo.get("registros", [])

    if not registros:
        return jsonify({"error": "Se requiere una lista de registros"}), 400

    nuevos_datos = pd.DataFrame(registros)
    modelo = LinearRegression()
    modelo.fit(nuevos_datos[["personas_en_fila"]], nuevos_datos["tiempo_real_espera"])

    return jsonify({"mensaje": "Modelo reentrenado correctamente", "registros_usados": len(registros)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
