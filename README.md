# Sistema Inteligente de Gestión de Filas — Guía paso a paso

Este proyecto tiene **tres partes** que deben correr al mismo tiempo, cada una en su propia terminal:

1. **`ai-service/`** — servicio de inteligencia artificial (Python) que predice el tiempo de espera.
2. **`backend/`** — API (Node.js + Express) conectada a PostgreSQL.
3. **`frontend/`** — la aplicación web (React) que ves en el navegador.

No necesitas experiencia previa. Sigue los pasos en orden y no te saltes ninguno.

---

## 0. Instalar los programas necesarios (una sola vez)

Instala esto en tu computadora si no lo tienes:

| Programa | Para qué sirve | Dónde descargarlo |
|---|---|---|
| Node.js (versión 18 o superior) | Corre el backend y el frontend | https://nodejs.org (elige la versión "LTS") |
| Python 3.10 o superior | Corre el servicio de IA | https://www.python.org/downloads/ |
| PostgreSQL | Base de datos | https://www.postgresql.org/download/ |
| Un editor de código (opcional pero recomendado) | Para ver y editar el código | https://code.visualstudio.com |

Para comprobar que quedaron instalados, abre una terminal (CMD, PowerShell o Terminal) y escribe:

```bash
node -v
python3 --version
psql --version
```

Si cada comando responde con un número de versión, todo está listo.

> En Windows, cuando instales PostgreSQL, el instalador te pedirá una **contraseña para el usuario `postgres`**. Anótala, la necesitarás en el paso 2.

---

## 1. Descomprimir el proyecto

Descomprime el archivo `.zip` que te entregué en una carpeta fácil de encontrar, por ejemplo `Documentos/proyecto-gestion-filas`. Deberías ver tres carpetas: `backend`, `frontend` y `ai-service`.

---

## 2. Configurar la base de datos

1. Abre una terminal y entra a psql (te pedirá la contraseña que pusiste al instalar PostgreSQL):

   ```bash
   psql -U postgres
   ```

2. Dentro de psql, crea la base de datos y sal:

   ```sql
   CREATE DATABASE gestion_filas;
   \q
   ```

3. Carga la estructura de tablas (esto crea usuarios, servicios, turnos, etc.) ejecutando, **desde la terminal normal** (no dentro de psql), parado en la carpeta del proyecto:

   ```bash
   psql -U postgres -d gestion_filas -f backend/sql/schema.sql
   ```

   Si todo sale bien, verás varias líneas que dicen `CREATE TABLE` e `INSERT 0 ...`.

---

## 3. Configurar y correr el backend (API)

1. Entra a la carpeta del backend:

   ```bash
   cd backend
   ```

2. Instala las dependencias (solo la primera vez):

   ```bash
   npm install
   ```

3. Copia el archivo de configuración de ejemplo:

   - En Mac/Linux: `cp .env.example .env`
   - En Windows (PowerShell): `copy .env.example .env`

4. Abre el archivo `.env` con tu editor de texto y coloca la contraseña de tu PostgreSQL en `DB_PASSWORD`. Deja lo demás igual.

5. Enciende el backend:

   ```bash
   npm start
   ```

   Deberías ver: `Backend escuchando en http://localhost:4000`.

   Déjalo corriendo — **no cierres esta terminal**.

---

## 4. Configurar y correr el servicio de inteligencia artificial

Abre **una nueva terminal** (deja la del backend abierta) y entra a la carpeta `ai-service`:

```bash
cd ai-service
pip install -r requirements.txt
python3 app.py
```

Deberías ver un mensaje como `Modelo entrenado. Coeficiente: ...` y luego `Running on http://127.0.0.1:5001`.

Déjalo corriendo también.

> Si `pip` no funciona, prueba con `pip3 install -r requirements.txt`. En Windows, prueba `python app.py` en vez de `python3 app.py`.

---

## 5. Configurar y correr el frontend (lo que se ve en el navegador)

Abre **una tercera terminal** y entra a la carpeta `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Verás un mensaje como:

```
Local:   http://localhost:5173/
```

Abre esa dirección en tu navegador (Chrome, Edge, etc.). Ahí verás la aplicación funcionando: la vista de usuario para generar turnos y el panel administrativo.

---

## 6. Probar que todo funciona junto

1. En la vista **Usuario**, selecciona un servicio y presiona "Generar turno". Deberías ver tu código de turno y el tiempo estimado calculado por el modelo de IA.
2. Cambia a la pestaña **Panel Administrativo**: ahí verás ese turno en la tabla, con los indicadores actualizados.
3. Presiona "Atender" junto al turno: pasará a estado "atendido" y quedará registrado en el historial (que es justamente lo que después alimenta al modelo de IA).

Si ves datos moviéndose entre las tres partes, ¡el sistema completo está funcionando!

---

## Resumen de comandos (para cuando ya lo tengas instalado)

Cada vez que quieras volver a correr el proyecto, solo necesitas 3 terminales abiertas al mismo tiempo:

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd ai-service && python3 app.py

# Terminal 3
cd frontend && npm run dev
```

---

## Problemas comunes

| Problema | Solución probable |
|---|---|
| `Error: connect ECONNREFUSED` al iniciar el backend | PostgreSQL no está corriendo, o la contraseña en `.env` está mal. |
| El backend dice que no puede contactar la IA | Verifica que `ai-service` esté corriendo en el puerto 5001 (`AI_SERVICE_URL` en `.env`). El sistema igual funciona con una estimación básica de respaldo. |
| `npm: command not found` | Node.js no quedó bien instalado; reinstálalo y reinicia la terminal. |
| La página del frontend no carga datos | Revisa que el backend (`localhost:4000`) esté corriendo antes de abrir el frontend. |
| Puerto ocupado ("address already in use") | Ya tienes otro proceso usando ese puerto; ciérralo o cambia el número de puerto en `.env` / `vite.config.js`. |

---

## Qué mostrar en la sustentación

- El flujo completo: generar un turno → ver la predicción de la IA → atenderlo desde el panel administrativo.
- El archivo `backend/sql/schema.sql` para explicar la base de datos.
- El archivo `ai-service/app.py` para explicar cómo funciona el modelo de regresión.
- Los componentes `VistaUsuario.jsx` y `VistaAdmin.jsx` como evidencia del frontend en React.

## Próximos pasos sugeridos (si quieren mejorar el proyecto)

- Agregar autenticación real con contraseñas cifradas (librería `bcrypt`).
- Enviar notificaciones reales por correo o SMS cuando el turno esté próximo.
- Reemplazar el archivo `historial_simulado.csv` por datos reales una vez el sistema esté en uso, y llamar al endpoint `/reentrenar` del servicio de IA.
- Desplegar el backend y el frontend en un servicio en la nube (Render, Railway, Vercel) para que no dependan de tu computadora.
