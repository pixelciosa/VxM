# VX+ (VxM) - Integrador de Agentes de IA Multimodales

Vx+ (Voy por Mas) es una plataforma avanzada que integra conversaciones multimodales con Agentes de IA proactivos. El proyecto utiliza un modelo de negocio orientado a la captura de datos anónimos  para investigación demográfica y de producto, mientras ofrece una experiencia de usuario fluida inspirada en interfaces de mensajería populares como WhatsApp y Telegram.

## 🚀 Características Principales

- **Agentes de IA Personalizados**: Creación de agentes basados en la combinación de *Contextos* y *Arquetipos*.
- **Interfaz Multimodal**: Soporte para interacciones de texto y multimedia.
- **Modelos de IA**: Integración con Google Gemini (Generative AI).
- **Backend Robusto**: Desarrollado con FastAPI y Python.
- **Base de Datos**: PostgreSQL gestionado a través de Supabase.
- **Arquitectura de Agentes**: Conectados mediante MCP (Model Context Protocol).

## 📁 Estructura del Proyecto

- `/Frontend`: Aplicación web desarrollada en React + Vite + Tailwind CSS.
- `/Backend`: API modular desarrollada en FastAPI (Python).
- `docker-compose.yml`: Configuración para orquestación de contenedores.

## 🛠️ Requisitos Previos

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.11+)
- Cuenta en [Supabase](https://supabase.com/)
- API Key de Google Gemini

## ⚙️ Configuración del Entorno

Crea archivos `.env` tanto en la raíz como en las carpetas respectivas basándote en los archivos `.env.example`.

Variables principales requeridas:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

## 🏃 Cómo Ejecutar

### Usando Docker (Recomendado)

```bash
docker-compose up --build
```
Esto iniciará:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

### Desarrollo Manual

#### Backend
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 🧠 Lógica de Agentes

Los agentes se definen por la intersección de:
1. **Contextos**: El entorno o trasfondo del agente (ej. Jedi Samurai, Artista).
2. **Arquetipos**: La personalidad o rol interactivo (ej. Coach, Competidor).

Cada combinación genera un avatar único y un comportamiento específico diseñado para ayudar al usuario a alcanzar sus objetivos de manera proactiva.

---
© 2026 Pixelciosa
