# ADOPTME Backend

API REST para la gestión de adopción de mascotas, con autenticación JWT, CRUD de usuarios y mascotas, y flujo de solicitudes de adopción.

---

## Table of Contents

- [Descripción](#descripción)  
- [Requisitos](#requisitos)  
- [Instalación local](#instalación-local)  
- [Variables de entorno](#variables-de-entorno)  
- [Ejecutar con Docker Compose](#ejecutar-con-docker-compose)  
- [Documentación de la API](#documentación-de-la-api)  
- [Ejecutar tests](#ejecutar-tests)  
- [Ejemplos de uso](#ejemplos-de-uso)  

---

## Descripción

Este proyecto proporciona:

- **Autenticación**: registro y login con JWT.  
- **Gestión de usuarios**: ver, editar y eliminar perfil; listado de usuarios.  
- **Gestión de mascotas**: CRUD (solo admin para crear/editar/eliminar).  
- **Flujo de adopción**: crear solicitud, listar propias, aprobar/rechazar (admin), eliminar solicitud.  
- **Mocks**: generar datos de prueba de usuarios y productos.  
- **Documentación interactiva** con Swagger UI.  

---


## Instalación local

```bash
git clone https://github.com/tu-usuario/backend3-mocking-project.git
cd backend3-mocking-project
npm install
cp .env.example .env        # configura tus secrets en .env
npm run dev                 # arranca en modo desarrollo (nodemon)
