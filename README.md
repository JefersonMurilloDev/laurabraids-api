# LauraBraids API

Una API REST moderna para la gestión integral de un negocio de trenzas y peinados africanos. Construida con Node.js, Express y TypeScript, proporcionando un backend robusto para servicios de estilismo profesional.

## 🌟 Características

- **Gestión de Usuarios**: Sistema completo de autenticación y autorización con JWT
- **Catálogo de Estilos**: Administración de trenzas y peinados con precios
- **Sistema de Citas**: Reserva y gestión de citas para servicios de estilismo
- **Gestión de Estilistas**: Perfiles profesionales con especialidades
- **Catálogo de Productos**: Productos para el cuidado del cabello y accesorios
- **Sistema de Reseñas**: Valoraciones y comentarios de clientes
- **Autenticación Robusta**: JWT con diferentes niveles de autorización
- **Validación de Datos**: Esquemas Zod para validación estricta

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: MySQL con connection pooling
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: Zod schemas
- **Seguridad**: bcryptjs para hashing de contraseñas
- **Testing**: Jest + Supertest
- **Desarrollo**: Nodemon para hot reload

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- MySQL Server
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/laurabraids-api.git
cd laurabraids-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=laurabraids_db

# Configuración JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# Puerto del servidor
PORT=3000
```

### 4. Configurar la base de datos
```bash
# Crear la base de datos usando el esquema proporcionado
mysql -u tu_usuario -p < database-schema.sql
```

### 5. Compilar TypeScript
```bash
npm run build
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Ejecutar tests
npm test
```

## 📁 Estructura del Proyecto

```
src/
├── index.ts              # Punto de entrada de la aplicación
├── config/              # Configuración de base de datos
├── controllers/         # Lógica de negocio y manejo de requests
├── routes/              # Definición de rutas REST
├── middleware/          # Middleware de autenticación y validación
├── schemas/             # Esquemas de validación Zod
├── data/                # Capa de acceso a datos
├── interfaces/          # Definiciones de tipos TypeScript
├── scripts/             # Scripts de utilidad para base de datos
└── __tests__/           # Tests unitarios
```

## 🔐 Autenticación y Autorización

La API utiliza JWT para autenticación con diferentes niveles de acceso:

- **Token básico**: Validación de token válido
- **Usuario autenticado**: Requiere usuario logueado
- **Administrador**: Acceso completo a todas las funciones
- **Propietario o Admin**: Acceso a recursos propios o administrador

## 📊 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario autenticado

### Estilos y Trenzas
- `GET /api/styles` - Listar todos los estilos
- `POST /api/styles` - Crear nuevo estilo (Admin)
- `PUT /api/styles/:id` - Actualizar estilo (Admin)
- `DELETE /api/styles/:id` - Eliminar estilo (Admin)

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear nueva cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto (Admin)

> Para una documentación completa de todos los endpoints, consulta el archivo `POSTMAN_GUIDE.txt`

## 🧪 Testing

La aplicación incluye tests unitarios completos:

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- --testNamePattern="nombre_del_test"
```

Los tests incluyen:
- Validación de endpoints CRUD
- Autenticación y autorización
- Validación de esquemas de datos
- Manejo de errores

## 🛡️ Seguridad

- Contraseñas hasheadas con bcryptjs (10 salt rounds)
- Validación estricta de entrada con Zod
- Protección de rutas con middleware de autenticación
- Variables de entorno para datos sensibles
- Manejo seguro de tokens JWT

## 🚦 Estados HTTP

La API utiliza códigos de estado HTTP estándar:
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Jefferson Murillo

Desarrollado para LauraBraids - Servicios profesionales de trenzas y peinados africanos.

---

*Para soporte técnico o consultas sobre la API, consulta la documentación de endpoints en `POSTMAN_GUIDE.txt`*
