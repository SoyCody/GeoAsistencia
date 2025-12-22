# GeoAsistencia
## Backend

GeoAsistencia es un sistema backend orientado a la gestión de asistencia georreferenciada, 
con enfoque en seguridad, confidencialidad de datos personales y trazabilidad de acciones.

El proyecto está construido bajo una arquitectura modular, usando Node.js y PostgreSQL con PostGIS 
para el manejo de información espacial.

## Stack Tecnológico

- **Node.js** – Runtime principal
- **Express.js** – Framework HTTP
- **PostgreSQL** – Base de datos relacional
- **PostGIS** – Extensión espacial para geolocalización
- **JWT (JSON Web Tokens)** – Autenticación
- **bcrypt** – Hash de contraseñas
- **dotenv** – Variables de entorno

## Arquitectura

El backend sigue una arquitectura modular basada en capas:

- **Routes** → Definen los endpoints HTTP
- **Controllers** → Manejan la lógica de request/response
- **Services** → Lógica de negocio (cuando aplica)
- **Repositories** → Acceso a base de datos
- **Middlewares** → Seguridad, validaciones y control de acceso
- **Utils** → Funciones reutilizables (JWT, helpers)

Cada módulo es independiente y escalable.

## Estructura de Carpetas

src/
├── config/
│   ├── .env                # Variables de entorno
│   └── db.js               # Configuración de PostgreSQL
│
├── db/
│   └── db.sql              # Script inicial de base de datos
│
├── middlewares/
│   └── auth.middleware.js  # Protección por JWT y roles
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.repository.js
│   │   ├── auth.utils.js
│   │   └── auth.validator.js
│   │
│   ├── users/
│   │   ├── user.controller.js
│   │   ├── user.repository.js
│   │   └── user.validator.js
│   │
│   └── auditoria/
│       ├── auditoria.constants.js
│       ├── auditoria.repository.js
│       └── auditoria.service.js
│
├── routes/
│   ├── auth.js
│   └── user.js
│
├── utils/
│   └── jwt.js
│
└── index.js                # Punto de entrada del servidor

## Configuración del Entorno

Crear un archivo `.env` en `src/config` con las siguientes variables:

```env
PORT=3000
DATABASE_URL=postgres://usuario:password@host:puerto/basedatos
JWT_SECRET=clave_super_secreta
JWT_EXPIRES_IN=8h


---

## Base de Datos (PostgreSQL + PostGIS)

```md
## Base de Datos

El sistema utiliza PostgreSQL con la extensión PostGIS para manejar datos geoespaciales.

Características:

- Soporte para geocercas
- Almacenamiento de coordenadas
- Consultas espaciales
- Separación entre datos sensibles y operativos

Extensión requerida:

```sql
CREATE EXTENSION postgis;


---

## Seguridad y Autenticación

```md
## Seguridad y Autenticación

La autenticación se maneja mediante JWT.

Flujo:
1. Usuario se autentica
2. Se genera un token JWT
3. El token se envía en el header Authorization
4. Middlewares validan:
   - Token válido
   - Estado del usuario
   - Rol (admin / usuario)

### Auth

Responsable de:
- Login
- Generación de JWT
- Validación de credenciales
- Utilidades de seguridad

Archivos clave:
- auth.controller.js
- auth.repository.js
- auth.utils.js
- auth.validator.js

### Users

Responsable de:
- Creación de usuarios
- Asignación de perfiles
- Control de estado
- Separación de datos personales y operativos

Archivos clave:
- user.controller.js
- user.repository.js
- user.validator.js

## Auditoría

El sistema cuenta con un módulo de auditoría para registrar:

- Acciones críticas
- Cambios de estado
- Operaciones administrativas
- Eventos sensibles

La auditoría es automática y centralizada.

Archivos:
- auditoria.constants.js
- auditoria.repository.js
- auditoria.service.js

## Comandos

Instalar dependencias:
npm install

Ejecutar en desarrollo:
npm run dev

Ejecutar en producción:
npm start

## Cumplimiento de la LOPDP 

GeoAsistencia ha sido diseñado considerando los principios establecidos en la
**Ley Orgánica de Protección de Datos Personales (LOPDP)** del Ecuador, aplicando
medidas técnicas y organizativas desde la arquitectura del sistema.


### Minimización de Datos

El sistema recolecta únicamente los datos estrictamente necesarios para su
funcionamiento.

- Los datos personales sensibles se almacenan en la entidad `persona`
- Los datos operativos y laborales se manejan en la entidad `perfil`
- Las credenciales no almacenan información en texto plano

### Confidencialidad y Control de Acceso

El acceso a datos personales está protegido mediante:

- Autenticación basada en JWT
- Autorización por roles (admin / usuario)
- Middlewares de seguridad
- Tokens con tiempo de expiración

Los endpoints sensibles solo pueden ser accedidos por usuarios autorizados.

### Trazabilidad y Auditoría

GeoAsistencia implementa un sistema de auditoría para cumplir con el principio
de responsabilidad proactiva:

- Registro de acciones administrativas
- Registro de accesos a información sensible
- Almacenamiento de eventos críticos
- Identificación del usuario que realiza cada acción

La auditoría permite detectar usos indebidos y responder a incidentes de seguridad.

### Integridad y Seguridad

El sistema implementa medidas técnicas para proteger los datos:

- Hash de contraseñas con algoritmos seguros
- Validaciones de entrada para prevenir inyecciones
- Uso de consultas parametrizadas
- Manejo controlado de errores