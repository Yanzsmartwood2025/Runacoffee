# RUNA COFFEE - Interactive Coffee Experience Website

## 📖 Descripción

Este proyecto es el sitio web oficial de RUNA COFFEE, una marca de café de especialidad de Colombia. No es solo una página web informativa, sino una experiencia interactiva diseñada para sumergir al usuario en el mundo de Runa a través de elementos visuales, sonoros y de realidad aumentada.

El sitio está construido como una aplicación web estática (static web app), utilizando tecnologías modernas para ofrecer una experiencia rica y fluida directamente en el navegador.

## ✨ Características Principales

- **Experiencia 3D y Realidad Aumentada (AR):**
  - Visualizador de un libro 3D interactivo que cuenta la historia de la marca.
  - Un modelo 3D de un árbol místico que se puede ver en Realidad Aumentada en dispositivos compatibles.
- **Mezclador de Sonido Ambiental:** Permite a los usuarios crear su propio ambiente sonoro mezclando sonidos de la naturaleza (río, pájaros, lluvia, etc.) mientras navegan por el sitio.
- **Autenticación de Usuarios:** Integración con Firebase para permitir el inicio de sesión a través de Google, Facebook y Apple.
- **Catálogo de Productos:** Muestra los diferentes tipos de café de especialidad ofrecidos por RUNA COFFEE.
- **Interfaz de Carrito de Compras:** Funcionalidad para que los usuarios añadan productos a un carrito de compras.
- **Tema Claro y Oscuro:** Selector de tema para adaptar la apariencia del sitio a las preferencias del usuario.
- **Diseño Responsivo:** Adaptado para una correcta visualización en dispositivos móviles y de escritorio.

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - HTML5
  - CSS3
  - [Tailwind CSS](https://tailwindcss.com/): Para un desarrollo rápido y moderno de la interfaz.
  - JavaScript (ES6 Modules)
- **Autenticación:**
  - [Firebase Authentication](https://firebase.google.com/docs/auth): Para gestionar el inicio de sesión de usuarios.
- **3D / AR:**
  - [Google `<model-viewer>`](https://modelviewer.dev/): Para renderizar los modelos 3D y la experiencia de Realidad Aumentada.

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
