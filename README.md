# Expense Tracker - Aplicación de Gestión Financiera Personal

## 📝 Descripción

Aplicación fullstack de gestión financiera personal que permite el registro y seguimiento de ingresos, gastos, tarjetas de crédito, y generación de reportes financieros. Desarrollada con una arquitectura moderna y escalable utilizando Next.js para el frontend y NestJS para el backend.

## 🏗️ Arquitectura del Proyecto

```
expense-tracker/
├── app/                        # Frontend - Next.js
│   ├── src/
│   │   ├── app/               # Páginas y rutas de la aplicación
│   │   │   ├── (dashboard)/   # Rutas protegidas del dashboard
│   │   │   ├── auth/          # Rutas de autenticación
│   │   │   └── layout.tsx     # Layout principal de la aplicación
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── accounts/      # Componentes relacionados con cuentas
│   │   │   ├── cards/         # Componentes de tarjetas de crédito
│   │   │   ├── categories/    # Componentes de categorías
│   │   │   ├── layout/        # Componentes de estructura
│   │   │   ├── transactions/  # Componentes de transacciones
│   │   │   └── ui/           # Componentes de UI reutilizables
│   │   └── lib/              # Utilidades y configuraciones
│   │       ├── api/          # Cliente API y configuraciones
│   │       ├── store/        # Estado global (Zustand)
│   │       └── types/        # Tipos TypeScript
│   └── public/               # Archivos estáticos
│
├── server/                    # Backend - NestJS
│   └── src/
│       ├── accounts/         # Módulo de cuentas
│       ├── auth/            # Módulo de autenticación
│       ├── cards/           # Módulo de tarjetas de crédito
│       ├── categories/      # Módulo de categorías
│       ├── dashboard/       # Módulo del dashboard
│       ├── fixed-expenses/  # Módulo de gastos fijos
│       ├── transactions/    # Módulo de transacciones
│       └── users/          # Módulo de usuarios
│
├── docker-compose.yml        # Configuración de Docker
├── package.json             # Configuración del monorepo
└── turbo.json              # Configuración de Turborepo
```

## 🚀 Tecnologías Principales

### Frontend (app/)

- **Framework**: Next.js 14
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS + Shadcn/ui
- **Estado Global**: Zustand
- **Gráficos**: Recharts
- **Formularios**: React Hook Form + Zod

### Backend (server/)

- **Framework**: NestJS
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: JWT
- **Validación**: class-validator
- **Documentación**: Swagger/OpenAPI

## 🛠️ Requisitos Previos

- Node.js >= 18
- npm >= 10.2.4
- PostgreSQL
- Docker & Docker Compose

## 📦 Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/puggioni/expense-tracker.git
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

4. Iniciar servicios de base de datos:

```bash
docker-compose up -d
```

5. Iniciar servicios de desarrollo:

```bash
npm run dev
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia todos los servicios en modo desarrollo
- `npm run build` - Construye todos los proyectos
- `npm run lint` - Ejecuta el linter en todos los proyectos
- `npm run test` - Ejecuta los tests en todos los proyectos

## ✨ Características Principales

### 💰 Gestión de Ingresos

- Registro de múltiples fuentes de ingresos
- Categorización de ingresos
- Ingresos recurrentes
- Historial detallado

### 💳 Gestión de Gastos

- Categorización de gastos
- Gastos fijos recurrentes
- Gastos variables
- Integración con tarjetas de crédito
- Alertas de vencimientos
- Sistema de cuotas

### 📊 Dashboard Financiero

- Métricas clave
- Comparativa ingresos vs gastos
- Proyección de saldo mensual
- Límites de gastos por categoría
- Histórico acumulado

### 📱 Características de la UI

- Diseño responsive
- Tema claro/oscuro
- Interfaz intuitiva
- Gráficos interactivos
- Tablas con ordenamiento y filtros

### 🔒 Seguridad

- Autenticación JWT
- Protección de rutas
- Validación de datos
- Encriptación de información sensible

## 🗄️ Estructura de la Base de Datos

### Entidades Principales

- Users
- Accounts
- Transactions
- Categories
- Cards
- CardExpenses
- FixedExpenses

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- **Agustín Puggioni** - _Desarrollo Full Stack_ - [puggioni](https://github.com/puggioni)

## 🙏 Agradecimientos

- Shadcn/ui por los componentes de UI
- Vercel por el hosting
- La comunidad de Next.js y NestJS
