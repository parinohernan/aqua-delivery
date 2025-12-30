# AquaDelivery - React Frontend

Aplicación PWA moderna para gestión de delivery de agua, construida con React 19, TypeScript, Vite y Zustand.

## 🚀 Características

- **React 19** - Framework más reciente
- **TypeScript** - Tipado estático completo
- **Vite** - Build tool rápido y moderno
- **Zustand** - Gestión de estado ligera
- **IndexedDB** - Almacenamiento offline
- **PWA** - Progressive Web App completa
- **Tailwind CSS** - Estilos modernos
- **React Router** - Navegación SPA
- **Leaflet** - Mapas interactivos

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 🏗️ Build

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
reactfront/
├── src/
│   ├── app/              # Configuración de la app
│   ├── components/       # Componentes compartidos
│   ├── features/         # Features modulares
│   ├── services/         # Servicios (API, storage, PWA)
│   ├── stores/           # Stores de Zustand
│   ├── hooks/            # Hooks personalizados
│   ├── utils/            # Utilidades
│   ├── types/            # Tipos TypeScript
│   └── styles/           # Estilos globales
└── public/               # Archivos estáticos
```

## 🏛️ Arquitectura

- **SOLID Principles** - Código limpio y mantenible
- **Feature-based** - Organización por features
- **Modular** - Componentes reutilizables
- **Type-safe** - TypeScript en todo el proyecto

## 📝 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```
VITE_API_BASE_URL=http://localhost:8001
```

