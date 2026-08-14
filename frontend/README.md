# Albergue Help - Frontend

Frontend de la aplicación **Albergue Help**, construido con React, Vite, TypeScript y Tailwind CSS.

## Propósito

Interfaz web/PWA para ayudar a personas durante situaciones de emergencia en Colombia a encontrar albergues disponibles.

## Stack

- **React**
- **Vite**
- **TypeScript**
- **Tailwind CSS**

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

## Ejecución local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Construcción para producción

```bash
npm run build
```

## Estado del proyecto

Este es el esqueleto inicial del frontend. Las pantallas, componentes y lógica de negocio se implementarán en siguientes iteraciones.