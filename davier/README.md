# 🛞 DAVIER — Boutique de Calzado

Sistema completo de e-commerce moderno para una boutique de zapatos, incluye tienda cliente y panel admin.

## 📁 Estructura del proyecto

```
davier/
├── index.html              # Página principal (tienda)
├── admin.html              # Panel de administración
├── css/
│   ├── main.css           # Estilos globales (header, footer, variables)
│   ├── hero.css           # Carrusel de banners
│   ├── catalog.css        # Catálogo, filtros, productos
│   ├── cart.css           # Carrito (drawer)
│   ├── checkout.css       # Pasarela de pago
│   └── admin.css          # Panel admin
├── js/
│   ├── products.js        # Base de datos de productos (editable)
│   ├── cart.js            # Lógica del carrito (localStorage)
│   ├── catalog.js         # Renderizado catálogo y filtros
│   ├── checkout.js        # Pasarela de pago (3 pasos)
│   ├── app.js             # Inicialización y eventos
│   └── admin.js           # Lógica del panel admin
└── README.md              # Este archivo
```

## 🚀 Cómo subir a GitHub (paso a paso)

### 1. **Instalación inicial (solo la primera vez)**

```bash
# Abre tu terminal / PowerShell en la carpeta donde descargaste DAVIER
cd C:\Users\TuUsuario\Desktop\davier
# (O donde esté tu carpeta davier)
```

### 2. **Inicializar Git en la carpeta**

```bash
git init
```

> Esto crea un repositorio local de Git. Aparecerá una carpeta `.git` (oculta).

### 3. **Agregar todos los archivos**

```bash
git add .
```

> El punto `.` significa "todos los archivos".

### 4. **Hacer el primer commit**

```bash
git commit -m "Inicial: DAVIER e-commerce v1.0"
```

> "Commit" = guardar una versión. El texto es la descripción del cambio.

### 5. **Crear un repositorio en GitHub**

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el **+** (arriba a la derecha) → **New repository**
3. Dale un nombre: `davier` (o lo que quieras)
4. Selecciona **Public** (para que sea visible)
5. **NO** inicialices con README (ya tienes archivos locales)
6. Clic en **Create repository**

### 6. **Conectar tu repositorio local con GitHub**

GitHub te mostrará comandos. En tu terminal, copia y pega lo que dice, pero será algo como:

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/davier.git
git push -u origin main
```

> Cambia `TU_USUARIO` por tu usuario de GitHub real.

### 7. **Ingresa credenciales** (si es la primera vez)

Cuando hagas `git push`, Git pedirá autenticación:
- **Usuario**: tu usuario de GitHub
- **Contraseña**: un token de acceso personal (no tu contraseña de GitHub)

#### Generar un token de acceso personal:

1. En GitHub, ve a **Settings** (arriba a la derecha, engranaje)
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Clic en **Generate new token (classic)**
4. Dale un nombre: `davier-push`
5. Marca **repo** (acceso completo a repositorios)
6. Clic en **Generate token**
7. **Copia el token** (aparece una sola vez)
8. En la terminal de Git, cuando pida contraseña, **pega el token**

### 8. **Verificar en GitHub**

Abre [github.com/TU_USUARIO/davier](https://github.com/TU_USUARIO/davier) en el navegador. Deberías ver todos tus archivos.

---

## 📝 Actualizar el código después (push recurrente)

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción breve del cambio"
git push
```

Ejemplo:
```bash
git add .
git commit -m "Fix: corregir animación del carrito"
git push
```

---

## 🏗️ Estructura de código

### **index.html** (Tienda)
- Encabezado sticky con logo DAVIER, navegación, carrito
- Banner carrusel con 3 promociones (editable en admin)
- Catálogo con filtros por género, talla, búsqueda
- Carrito lateral (drawer)
- Modal de checkout con 3 pasos
- Footer con newsletter

### **admin.html** (Panel Admin)
- **Login**: usuario `admin` / contraseña `davier2025`
- **Dashboard**: stats, órdenes recientes, top productos
- **Productos**: CRUD (crear, leer, editar, eliminar) de zapatos
- **Banners**: editar las 3 promociones del hero
- **Órdenes**: ver historial de pedidos
- **Configuración**: ajustes de tienda y cambio de contraseña

### **Datos persistentes**
- **Productos**: se guardan en `localStorage` cuando editas en admin
- **Carrito**: se guarda en `localStorage` en el navegador del cliente
- **Órdenes**: demo (no hay backend real)

---

## 🎨 Personalización rápida

### Cambiar colores principales
Abre `css/main.css` y edita `:root`:

```css
:root {
  --accent:      #c8ff00;    /* Verde lima – cambiar aquí */
  --accent2:     #ff3c6e;    /* Rosa/rojo */
  --accent3:     #3cf0e0;    /* Cyan */
  /* ... más colores */
}
```

### Agregar un nuevo producto
Abre `js/products.js` y agrega un objeto al array `PRODUCTS`:

```javascript
{ 
  id: 17, 
  name: "Mi nuevo zapato", 
  gender: "mujer", 
  category: "Zapatillas", 
  icon: "sneaker", 
  sizes: [35,36,37,38,39], 
  price: 185000, 
  discount: 0, 
  isNew: true 
}
```

O usa el panel admin en `admin.html` (login: admin / davier2025)

### Cambiar logo/marca
1. Busca "DAVIER" en `index.html` y `admin.html`
2. Reemplaza el texto
3. Edita los estilos del `.logo` en `css/main.css`

---

## 🔐 Seguridad (notas)

- **Admin auth**: El login está en memoria (sesión). Recarga = logout.
- **Datos**: Se guardan en `localStorage` del navegador (no es seguro para producción).
- **Carrito**: Los clientes pueden ver/editar el carrito en DevTools.
- **Checkout**: Es una UI mockup (no procesa pagos reales).

### Para producción:
- Usa un backend (Node.js, Django, etc.)
- Guarda datos en base de datos (PostgreSQL, MongoDB)
- Implementa autenticación real con JWT
- Integra una pasarela de pago real (Stripe, Mercado Pago, PSE)
- Usa HTTPS

---

## 📱 Responsive Design

- **Desktop**: 2 columnas en catálogo, hero landscape, banners completos
- **Tablet** (768px–1200px): ajustes de grid
- **Mobile** (<768px): 1 columna, menú colapsable, hero stacked

Prueba con DevTools (F12 → dispositivo móvil)

---

## 🎯 Rutas principales

- **Tienda**: `index.html`
- **Admin**: `admin.html`
- **Catálogo**: ir a `index.html` y desplazarse a "Catálogo"
- **Carrito**: botón del ícono en el header
- **Checkout**: "Ir al pago" desde el carrito

---

## 🛠️ Para futuros desarrollos

### Agregar carrito persistente en servidor:
1. Crear endpoint `/api/cart`
2. En `js/cart.js`, reemplazar `localStorage` con fetch/API

### Conectar pasarela de pago real:
1. Registrarse en Mercado Pago, Stripe o PSE (para Colombia)
2. En `js/checkout.js`, integrar el SDK del proveedor

### Crear dashboard de análisis:
1. Trackear eventos con Google Analytics o Mixpanel
2. Mostrar gráficos en `admin.html`

### Base de datos:
- Firebase (Firestore + Auth) es la opción más fácil sin backend propio
- O Node.js + Express + PostgreSQL para más control

---

## 📚 Recursos útiles

- [Git docs](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

## 👤 Autor

DAVIER — Boutique de Calzado  
Desarrollado con ❤️ por tu equipo de desarrollo

---

**¿Preguntas?** Revisa los comentarios en los archivos `.js` y `.css`. Cada módulo tiene documentación en la parte superior.
