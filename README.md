# RUNA COFFEE - Interactive Coffee Experience Website

## 📖 Descripción

Este proyecto es el sitio web oficial de RUNA COFFEE, una marca de café de especialidad de Colombia. No es solo una página web informativa, sino una experiencia interactiva diseñada para sumergir al usuario en el mundo de Runa a través de elementos visuales, sonoros y de realidad aumentada.

El sitio está construido como una aplicación web estática (static web app), utilizando tecnologías modernas para ofrecer una experiencia rica y fluida directamente en el navegador.

## ✨ Características Principales

- **Página Principal (`index.html`):**
  - **Experiencia 3D/AR:** Muestra un árbol místico interactivo usando `<model-viewer>`.
  - **Mezclador de Sonido Ambiental:** Permite a los usuarios mezclar sonidos de la naturaleza.
  - **Catálogo de Productos:** Un carrusel que presenta los cafés de la marca.
  - **Autenticación de Usuarios:** Integración con Firebase para inicio de sesión social.
  - **Tema Claro/Oscuro:** Adaptación visual según la preferencia del usuario.

- **Libro Interactivo (`runa-libro/index.html`):**
  - **Efecto de Paso de Página:** Simula un libro real usando la librería `Turn.js`.
  - **Herramientas Creativas:** Los usuarios pueden dibujar con un lápiz, escribir con diferentes fuentes, añadir imágenes, y borrar contenido en las páginas del cuaderno.
  - **Persistencia de Datos:** Utiliza **Firestore** para guardar las creaciones de cada usuario, permitiendo que su cuaderno personalizado se conserve entre sesiones.
  - **Utilidades Integradas:** Incluye una calculadora estilo TI-89 y herramientas para compartir e imprimir.

- **Videojuego "Runa Defenders" (`RunaDefenders/index.html`):**
  - **Género Tower Defense:** Un juego donde el jugador defiende el Árbol de Runa de oleadas de plagas.
  - **Gráficos 2D y 3D:** Combina un juego 2D renderizado en `<canvas>` con un árbol de vida 3D renderizado con **Three.js**.
  - **Audio Inmersivo:** Usa **Tone.js** para efectos de sonido y música de fondo.
  - **Sistema de Progresión:** Incluye múltiples niveles, oleadas de enemigos y la capacidad de guardar el progreso del jugador a través de **Firestore**.

## 🛠️ Tecnologías Utilizadas

- **Frontend General:**
  - HTML5, CSS3, JavaScript (ES6 Modules)
  - [Tailwind CSS](https://tailwindcss.com/): Para un desarrollo rápido y moderno de la interfaz.
  - [jQuery](https://jquery.com/): Usado principalmente en la sección del libro interactivo.

- **Autenticación y Base de Datos:**
  - [Firebase](https://firebase.google.com/):
    - **Authentication:** Para gestionar el inicio de sesión de usuarios (Google, Facebook, Apple).
    - **Firestore:** Para guardar el progreso del juego y el contenido del cuaderno digital de cada usuario.

- **Gráficos y Animación:**
  - [Google `<model-viewer>`](https://modelviewer.dev/): Para los modelos 3D/AR en la página principal.
  - [Three.js](https://threejs.org/): Para renderizar y animar el árbol 3D en el juego "Runa Defenders".
  - [Turn.js](http://www.turnjs.com/): Para la animación de paso de página del libro interactivo.
  - HTML `<canvas>`: Para la renderización del gameplay 2D en "Runa Defenders".

- **Audio:**
  - [Tone.js](https://tonejs.github.io/): Para la síntesis de audio y efectos de sonido en "Runa Defenders".

## 🚀 Cómo Empezar

Este es un proyecto web estático, lo que significa que no requiere un proceso de compilación complejo para ejecutarse.

### Prerrequisitos

- Un navegador web moderno (Chrome, Firefox, Safari, Edge).
- Un editor de código (como [Visual Studio Code](https://code.visualstudio.com/)).

### Instalación y Ejecución Local

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/Yanzsmartwood2025/Runacoffee.git
    ```
2.  **Navega al directorio del proyecto:**
    ```bash
    cd Runacoffee
    ```
3.  **Inicia un servidor local:**
    La forma más sencilla de servir los archivos es utilizando una extensión de servidor en vivo en tu editor de código. Por ejemplo, si usas VS Code, puedes instalar la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

    Una vez instalada, simplemente haz clic derecho en el archivo `public/index.html` y selecciona "Open with Live Server". Esto abrirá el sitio en tu navegador y se recargará automáticamente cada vez que hagas un cambio en el código.

## 📁 Estructura de Archivos

El código fuente principal se encuentra dentro del directorio `/public`.

```
.
├── public/
│   ├── css/
│   │   └── main-style.css      # Estilos personalizados
│   ├── js/
│   │   ├── header_auth_animation.js # Lógica para la animación del icono de login
│   │   └── ...
│   ├── assets/                 # Todos los recursos estáticos
│   │   ├── 3D/                 # Modelos 3D (.glb, .usdz)
│   │   ├── gif/                # GIFs para el mezclador de sonido
│   │   ├── imagenes/           # Imágenes y logos
│   │   ├── mp3/                # Archivos de audio para el mezclador
│   │   └── videos/             # Videos de fondo y animaciones
│   ├── index.html              # Página principal
│   ├── libro.html              # Página del libro interactivo
│   ├── firebase-auth.js        # Lógica de autenticación con Firebase
│   └── ...
└── README.md                   # Este archivo
```
