# 🧩 Proyecto Final — Sistema Gestor de Clientes y Órdenes

### 👨‍💻 Universidad — Ingeniería de Software II  
**Autor:** Brayan Fuquene  
**Periodo:** 2025-2  
**Profesor:** Carlos Arenas
**Fecha de entrega:** 6/10/2025

---

## 📘 Descripción general

El sistema implementa una **arquitectura de microservicios** para gestionar clientes y órdenes, con autenticación, gateway y bases de datos distribuidas.  
Cada servicio es independiente, con su propia base de datos y lenguaje de programación, pero se comunican a través de un **API Gateway** registrado en **Eureka**.

**Objetivo:**  
Permitir registro/login de usuarios, gestión de clientes y creación de órdenes vinculadas a cada cliente.

---

## 🧱 Arquitectura general (Modelo 4+1 de Kruchten)

El sistema se documenta según las **4+1 vistas** de Philippe Kruchten:

| 🔍 Vista | 📄 Documento / Archivo | 📁 Ubicación |
|-----------|------------------------|---------------|
| **Lógica (Casos de uso)** | Manual Técnico | `/Documentos/Manual_Tecnico.pdf` |
| **Desarrollo (Estructura del código)** | Diagramas UML | `/Documentos/Diagramas_Arquitectura_4+1.pdf` |
| **Despliegue (Componentes)** | Diagramas UML | `/Documentos/Diagramas_Arquitectura_4+1.pdf` |
| **Física (Infraestructura)** | Configuración Docker + BD | `/docker-compose/` y Manual Técnico |

---

## 🗂️ Estructura del proyecto

<img width="438" height="325" alt="image" src="https://github.com/user-attachments/assets/cf432208-0180-4fbb-b57c-3d06a30245c0" />



---

## ⚙️ Requisitos previos

Asegúrate de tener instalado:

| Software | Versión recomendada |
|-----------|---------------------|
| 🐳 Docker y Docker Compose | 26+ |
| ☕ Java JDK | 21 |
| 🧠 Node.js | 20+ |
| 🐍 Python | 3.11+ |
| 🧩 Maven | 3.9+ |
| 🗄️ PostgreSQL / Oracle / MongoDB | Incluidas en Docker |

---

## 🚀 Ejecución del proyecto

### 🧱 1. Levantar bases de datos con Docker

```bash
# Login-MS (PostgreSQL)
cd login-ms
docker compose up -d

# Oracle (para Customers-MS)
cd oracle/
docker compose up -d

# MongoDB (para Orders-MS)
cd orders-ms
docker compose up -d

