# 🎓 SAPFPI-SENA
### Sistema de Administración y Gestión de la Programación de la Formación Profesional Integral

<p align="center">
  <img src="https://img.shields.io/badge/Proyecto-SENA-39A900?style=for-the-badge" alt="Proyecto SENA">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-blue?style=for-the-badge" alt="En desarrollo">
  <img src="https://img.shields.io/badge/Interfaz-Responsive-purple?style=for-the-badge" alt="Interfaz web">
</p>

<p align="center">
  <strong>Una interfaz web para organizar y administrar información relacionada con la programación de la formación profesional integral.</strong>
</p>

---

## 📌 Descripción del proyecto

**SAPFPI-SENA** es un proyecto web orientado a la gestión académica, diseñado para facilitar la organización de información relacionada con instructores, competencias, asignaciones y fichas tituladas.

El sistema presenta una interfaz moderna con elementos visuales de tipo *glassmorphism*, navegación por módulos, tablas de registros, formularios y una pantalla de acceso.

El proyecto utiliza tecnologías web fundamentales para construir una aplicación interactiva que puede servir como base para desarrollar un sistema de gestión académica más completo.

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 👨‍🏫 Instructores | Consulta y gestión de registros de instructores. |
| 📚 Competencias | Organización de la información de las competencias. |
| 🔗 Asignaciones | Administración de registros de asignaciones. |
| 📁 Fichas tituladas | Organización de información relacionada con las fichas de formación. |
| 🔐 Pantalla de acceso | Interfaz de bloqueo, acceso mediante credenciales y acceso rápido. |
| 📊 Panel de indicadores | Visualización de contadores y estadísticas de los módulos. |
| 🔎 Búsqueda | Campo de búsqueda para localizar registros. |
| 📝 Formularios CRUD | Interfaz para crear, consultar, actualizar y eliminar registros. |
| 💾 Almacenamiento local | Uso de `localStorage` con la clave `sapfpiDB` y un mecanismo de ofuscación XOR + Base64. |
| 🎨 Diseño visual | Interfaz con efectos de cristal, fondo animado, iconos y componentes visuales. |

> **Nota:** las funcionalidades descritas corresponden a la interfaz y a la organización visible del proyecto. Su comportamiento efectivo depende de la implementación JavaScript.

## 🖥️ Tecnologías utilizadas

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=flat-square&logo=fontawesome&logoColor=white" alt="Font Awesome">
  <img src="https://img.shields.io/badge/Google_Fonts-4285F4?style=flat-square&logo=googlefonts&logoColor=white" alt="Google Fonts">
</p>

- **HTML5:** estructura y componentes de la aplicación.
- **CSS3:** estilos, distribución, animaciones y efectos visuales.
- **JavaScript:** interactividad, formularios y lógica de gestión de registros.
- **Font Awesome:** iconografía de la interfaz.
- **Google Fonts:** tipografía Inter.

## 📂 Estructura del proyecto

```text
sapfpi-SENA/
│
├── index.html          # Página principal de la aplicación
│
├── Js/
│   └── js.js           # Lógica e interactividad con JavaScript
│
├── css/
│   └── style.css       # Estilos y diseño visual
│
├── img/                # Recursos gráficos e imágenes
│
└── README.md           # Documentación del proyecto
```

## ⚙️ Instalación y ejecución

### Requisitos

- Un navegador web actualizado.
- Git, opcional para clonar el repositorio.
- Un editor de código, como Visual Studio Code.

### 1. Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/oscarchavesamorocho-wq/sapfpi-SENA.git
```

### 2. Entrar en la carpeta

```bash
cd sapfpi-SENA
```

### 3. Abrir el proyecto

Abre la carpeta en Visual Studio Code y ejecuta `index.html` con la extensión **Live Server**, o abre el archivo directamente en tu navegador.

La aplicación utiliza recursos externos para algunas fuentes e iconos, por lo que necesitarás conexión a internet para cargarlos desde sus proveedores.

## 🔐 Almacenamiento y seguridad

El proyecto identifica su almacenamiento local mediante la clave:

```javascript
const DB_KEY = 'sapfpiDB';
```

La implementación contempla un mecanismo de transformación de datos mediante XOR y Base64 antes de almacenarlos.

**Consideraciones importantes:**

- `localStorage` almacena los datos en el navegador del usuario.
- Los datos locales no se sincronizan automáticamente entre diferentes dispositivos o navegadores.
- Base64 es una codificación, no un cifrado.
- XOR con una clave incluida en el código no proporciona protección criptográfica suficiente para información sensible.
- La autenticación implementada únicamente en el frontend no sustituye la validación de identidad y permisos en un servidor.

Para utilizar el sistema en un entorno real, se recomienda implementar un backend, una base de datos persistente, autenticación segura y controles de autorización.

## 🎨 Diseño e interfaz

La interfaz está organizada para facilitar la navegación y el acceso a los módulos de gestión.

Entre sus elementos visuales se encuentran:

- Diseño basado en *glassmorphism*.
- Fondo con elementos animados.
- Pantalla de bloqueo inspirada en interfaces móviles.
- Navegación por pestañas.
- Tablas para mostrar registros.
- Ventanas modales para formularios y confirmaciones.
- Indicadores visuales y notificaciones.

## 🚀 Mejoras futuras

- [ ] Implementar una API backend para la gestión de datos.
- [ ] Integrar una base de datos relacional.
- [ ] Implementar autenticación y autorización seguras.
- [ ] Validar los formularios tanto en el cliente como en el servidor.
- [ ] Incorporar paginación y filtros avanzados.
- [ ] Añadir pruebas automatizadas.
- [ ] Documentar el modelo de datos y las relaciones entre entidades.
- [ ] Configurar un entorno de despliegue para la aplicación.

## 👨‍💻 Repositorio

**Código fuente:** [oscarchavesamorocho-wq/sapfpi-SENA](https://github.com/oscarchavesamorocho-wq/sapfpi-SENA)

## 📄 Licencia

Este proyecto no especifica una licencia en esta documentación. Antes de permitir su reutilización o distribución, se recomienda definir una licencia adecuada.

---

<p align="center">
  <strong>SAPFPI-SENA</strong><br>
  Proyecto de desarrollo web orientado a la gestión académica.
</p>
