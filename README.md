# Expense Tracker - Aplicación de Gestión Financiera Personal

## Descripción

Aplicación fullstack de gestión financiera personal que permite el registro de ingresos, gastos, gestión de tarjetas de crédito y generación de reportes financieros.

## Estructura del Proyecto

```
expense-tracker/
├── app/                # Frontend - Next.js
│   └── src/           # Código fuente del frontend
├── server/            # Backend - NestJS
│   └── src/           # Código fuente del backend
├── package.json       # Configuración del monorepo
└── turbo.json         # Configuración de Turborepo
```

## Tecnologías Principales

### Frontend (app/)

- Next.js 14
- TypeScript
- TailwindCSS
- Zustand (State Management)
- Recharts (Visualización de datos)
- Material-UI

### Backend (server/)

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Docker

## Requisitos Previos

- Node.js >= 18
- npm >= 10.2.4
- PostgreSQL
- Docker & Docker Compose

## Instalación

1. Clonar el repositorio:

```bash
git clone [url-del-repositorio]
cd expense-tracker
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp server/.env.example server/.env
cp app/.env.example app/.env
```

4. Iniciar servicios de desarrollo:

```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia todos los servicios en modo desarrollo
- `npm run build` - Construye todos los proyectos
- `npm run lint` - Ejecuta el linter en todos los proyectos
- `npm run test` - Ejecuta los tests en todos los proyectos

## Características Principales

### Gestión de Ingresos

- Registro de múltiples fuentes de ingresos
- Categorización de ingresos
- Ingresos recurrentes

### Gestión de Gastos

- Categorización de gastos
- Gastos fijos recurrentes
- Gastos variables
- Integración con tarjetas de crédito
- Alertas de vencimientos

### Dashboard Financiero

- Métricas clave
- Comparativa ingresos vs gastos
- Proyección de saldo mensual
- Límites de gastos por categoría
- Histórico acumulado

### Reportes

- Informes mensuales
- Exportación a Excel/PDF
- Informes para declaraciones impositivas

## Contribución

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.
