# Albergue Help - Frontend

Frontend de la aplicación **Albergue Help**, construido con React, Vite, TypeScript y Tailwind CSS.

## Propósito

Interfaz web/PWA para ayudar a personas durante situaciones de emergencia en Colombia a encontrar albergues disponibles.

## Stack

- **React**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **React Router**
- **Lucide React**

## Estructura

```text
frontend/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── pages/        # Vistas/pantallas de la aplicación
│   ├── services/     # Llamadas a API y servicios externos
│   ├── types/        # Tipos y definiciones TypeScript
│   └── utils/        # Funciones auxiliares
├── public/           # Archivos estáticos
├── Dockerfile        # Imagen Docker para desarrollo
└── README.md
```

## Requisitos

- Node.js 24 o superior
- npm

## Instalación

```bash
cd frontend
npm install
```

## Configuración

Copiar `.env.example` a `.env` y ajustar la URL del backend:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8000
```

## Ejecución local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Construcción para producción

```bash
npm run build
```

## Rutas

- `/` — Listado y búsqueda de albergues
- `/shelter/:id` — Detalle de un albergue