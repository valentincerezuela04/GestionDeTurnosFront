# 🗓️ Sistema de Gestión de Turnos — Trabajo Práctico Final (Programación IV – UTN)

Aplicación web para la **gestión integral de turnos, salas y reservas**, desarrollada como **Trabajo Práctico Final de Programación IV (2025)** en UTN.  
El frontend está construido **íntegramente en Angular 20** cumpliendo los requisitos obligatorios de la materia, y el proyecto está pensado para una futura ampliación como **Tesis Final** (con backend completo en Spring Boot + JWT).

---
🔗 **Backend (API REST):** https://github.com/luca884/Gestion-de-Turnos-BACK.git

## 🎯 Objetivo

Desarrollar una aplicación web funcional que permita:

- Autenticación de usuarios con **roles y permisos**
- **CRUD** de **Salas**
- **CRUD** de **Reservas** (con validación de solapamientos)
- Secciones protegidas mediante **Guards**
- Experiencia moderna: **responsive**, UI consistente y documentación clara
- **Integraciones**: Google Calendar (sincronización de agenda) y MercadoPago (seña/pago) en la versión backend

---

## ✨ Funcionalidades principales

### 👤 Usuarios
- Registro y login
- Roles con permisos (`CLIENTE`, `EMPLEADO`, `ADMIN`)
- Perfil de usuario
- Interceptor HTTP para JWT

### 📅 Reservas
- Crear reserva
- Ver “Mis reservas”
- Historial personal y general
- Cancelación
- Validación de solapamientos
- Visualización en calendario (FullCalendar)

### 🏢 Salas
- Listado de salas
- Crear / editar / eliminar (según rol)
- Administración desde UI dedicada

### 📊 Extra (nota superior / versión avanzada)
- Dashboard de pagos con estadísticas y gráficos (ApexCharts)
- Tablas con filtros y paginación (DataTables)
- Modo claro / oscuro (`ThemeService`)
- Componentes reutilizables de UI (`UiAlert`, `UiConfirm`)

---

## 🚀 Tecnologías utilizadas

### Frontend
- **Angular 20** (Stand-alone Components)
- Angular Router (lazy loading)
- **Angular Signals**
- **HttpClient** consumiendo API REST (Spring Boot + JWT)
- **Tailwind CSS 4** + **FlyonUI** (UI principal)
- **FullCalendar** (calendario interactivo)
- **ApexCharts** (dashboard de pagos)
- **DataTables** (tablas avanzadas)

### Backend
- **Spring Boot 3.4.x**
- Spring Security + JWT
- JPA / Hibernate
- MySQL
- Integración Google Calendar
- Integración MercadoPago

---

## 🔐 Roles y permisos

| Rol        | Acceso |
|------------|--------|
| `CLIENTE`  | Reservas propias, historial personal, calendario, perfil |
| `EMPLEADO` | Reservas, historial general, salas (editar), dashboard pagos |
| `ADMIN`    | Todo lo anterior + gestión de empleados + creación de salas |

---

## 🗺️ Rutas principales

| Ruta | Descripción | Roles |
|------|-------------|-------|
| `/login` | Inicio de sesión | Público |
| `/register` | Registro | Público |
| `/hall` | Listado de salas | Autenticado |
| `/hall/new` | Crear sala | ADMIN |
| `/reservas` | Mis reservas | CLIENTE, EMPLEADO, ADMIN |
| `/reservas/new` | Nueva reserva | CLIENTE, EMPLEADO |
| `/reservas/historial` | Historial personal | CLIENTE |
| `/reservas/historial-general` | Historial general | ADMIN, EMPLEADO |
| `/clientes` | Lista de clientes | ADMIN, EMPLEADO |
| `/empleados` | Gestión empleados | ADMIN |
| `/calendar` | Calendario reservas | Autenticado |
| `/perfil` | Perfil usuario | Autenticado |
| `/dashboardPagos` | Dashboard pagos | ADMIN, EMPLEADO |

---

## 🧩 Cumplimiento de requisitos del TP Final (UTN)

✅ **Proyecto creado íntegramente en Angular 20**  
✅ **Dos CRUD completos**: Salas y Reservas  
✅ **Login con distintos roles**: Cliente / Empleado / Admin  
✅ **Guards por autenticación y rol**: `authGuard`, `roleGuard`  
✅ **Peticiones HTTP**: HttpClient consumiendo API REST (Spring Boot)  
✅ **Repositorio con historial real de commits**  
✅ **Listo para presentación / exposición**

---

## 💳 Integración con Mercado Pago (versión backend)

Flujo general:

1. Al confirmar una reserva, el frontend solicita al backend un link de pago:  
   `POST /reserva/{id}/pago/mercado-pago`
2. El backend genera la preferencia en Mercado Pago y devuelve el `init_point`.
3. El usuario completa el pago en Mercado Pago.
4. El sistema puede confirmar el estado:  
   `PUT /reserva/{id}/confirmar-pago`

---

## 📆 Integración con Google Calendar (versión backend)

- La vista `/calendar` utiliza **FullCalendar** y consume:  
  `GET /calendario/eventos`
- Cada evento incluye: `id`, `start`, `end`, `title`, `description`
- Clientes ven solo sus reservas; empleados/admin ven el calendario completo.

> La autenticación y sincronización se gestionan desde el backend.

---

## 📁 Estructura del repositorio

```bash
.
├── FRONTEND/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── models/
│   │   │   └── app.routes.ts
│   │   ├── assets/
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── README.md
│
└── BACKEND/
    ├── src/main/java/com/utn/gestion_de_turnos/
    │   ├── controller/
    │   ├── model/
    │   ├── dto/
    │   ├── service/
    │   ├── repository/
    │   └── security/
    └── src/main/resources/application.properties
