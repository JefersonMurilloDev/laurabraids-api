# 💇‍♀️ LauraBraids API

API REST para gestión de servicios de trenzas, citas y clientes.

## 🚀 Tecnologías

- **Backend:** Node.js, Express.js
- **Lenguaje:** TypeScript
- **Base de datos:** MySQL
- **Autenticación:** JWT
- **Validación:** Express-validator

## 📋 Características

✨ CRUD completo de servicios  
✨ Gestión de citas y reservas  
✨ Administración de clientes  
✨ API RESTful con arquitectura modular  
✨ Validaciones robustas de datos

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/JefersonMurilloDev/laurabraids-api.git

# Instalar dependencias
cd laurabraids-api
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

## 📡 Endpoints Principales

```
GET    /api/services       - Listar servicios
POST   /api/services       - Crear servicio
GET    /api/appointments   - Listar citas
POST   /api/appointments   - Crear cita
```

## 🗂️ Estructura del Proyecto

```
src/
├── controllers/    # Lógica de controladores
├── models/         # Modelos de datos
├── routes/         # Definición de rutas
├── middlewares/    # Middlewares personalizados
└── config/         # Configuración
```

## 📝 Licencia

MIT

## 👤 Autor

**Jefferson Murillo**
- GitHub: [@JefersonMurilloDev](https://github.com/JefersonMurilloDev)
- LinkedIn: [Jefferson Murillo](https://linkedin.com/in/jefferson-murillo-palacios-4a25671b3)



