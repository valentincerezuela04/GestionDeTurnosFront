# 🗓️ Sistema de Gestión de Turnos — Trabajo Práctico Final (Programación IV – UTN)

Este repositorio contiene el **Trabajo Práctico Final de Programación IV (2025)**, desarrollado en coordinación con **Metodología de Sistemas II**, siguiendo la consigna oficial de la materia.  
El proyecto está desarrollado **íntegramente en Angular 20**, cumpliendo con todos los requisitos obligatorios establecidos para la aprobación.  
Además, se proyecta su futura ampliación para la **Tesis Final de la carrera**.

---

## 📌 Objetivo del Proyecto

Desarrollar una aplicación web funcional para la **gestión integral de turnos**, permitiendo a los usuarios autenticados reservar salas, visualizar disponibilidad, administrar sus reservas y mantener sincronización con Google Calendar (integración opcional ya implementada).

El sistema incluye:
- Login con roles
- CRUD de Salas
- CRUD de Reservas
- Guards por rol + autenticacion
- Diseño responsive
- Documentación clara

---

## 🚀 Tecnologías Utilizadas

### **Frontend**
- Angular 20 (Stand-alone Components)
- Angular Router (lazy loading)
- Angular Signals
- Servicios HttpClient
- HTML + CSS
- Manejo de DTOs, modelos e interfaces
- DatePipe y utilidades nativas
- libreria:FullCalendar

### **Backend (opcional / parte de la futura tesis)**
- Spring Boot 3.4.x
- Spring Security + JWT
- JPA / Hibernate
- MySQL
- Integración Google Calendar

---

## 📂 Estructura del Repositorio

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
    ├── src/
    │   ├── main/
    │   │   ├── java/com/utn/gestion_de_turnos/
    │   │   │   ├── controller/
    │   │   │   ├── model/
    │   │   │   ├── dto/
    │   │   │   ├── service/
    │   │   │   ├── repository/
    │   │   │   └── security/
    │   │   └── resources/
    │   │       └── application.properties
    ├── pom.xml
    └── README.md



---

# 🧩 Cumplimiento de los Requisitos del TP Final

### ✔️ 1. Proyecto creado íntegramente en Angular 20  
Cumplido.

### ✔️ 2. Dos CRUD completos  
- CRUD de Salas  
- CRUD de Reservas  

### ✔️ 3. Sistema de login con distintos roles  
Roles implementados:
- Cliente  
- Empleado  
- Administrador  

### ✔️ 4. Guards para proteger rutas según rol  
- `authGuard`  
- `roleGuard`

### ✔️ 5. Peticiones HTTP  
Uso de:
- HttpClient  
- JSON-server o API real  

### ✔️ 6. Repositorio con historial real de commits  
Cumplido.

### ✔️ 7. Presentación del software  
Listo para exposición en la fecha establecida.

---

## ⭐ Requisitos para Nota Superior (7 a 10)

### ✔️ Funcionalidad adicional
- Integración con Google Calendar  
- Módulo administrativo ampliado

### ✔️ Diseño visual destacado  
Limpio, prolijo y consistente.

### ✔️ Totalmente responsive  
Adaptado a desktop, tablet y móvil.

### ✔️ Documentación completa  
Incluye este README y material de apoyo.

---

# 📌 Funcionalidades Principales

### 👤 Usuarios
- Registro  
- Login  
- Roles con permisos  
- Acceso a secciones protegidas  

### 📅 Reservas
- Crear reserva  
- Verificar solapamientos  
- Cancelar  
- Ver “Mis Reservas”  
- Sincronizar con Google Calendar  

### 🏢 Salas
- Crear sala  
- Editar sala  
- Eliminar sala  
- Listar todas las salas  

---

# 🔐 Autenticación y Seguridad

- JWT (si se usa backend real)  
- Guards:
  - `authGuard`
  - `roleGuard`  
- Restricción por roles en rutas críticas

---

# 🛠️ Cómo Ejecutar el Proyecto

### **Frontend**
```bash
cd FRONTED/GestionDeTurnosFront
npm install
ng serve -o

