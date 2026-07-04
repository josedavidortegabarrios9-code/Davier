/* ================================================================
   DAVIER — js/products.js
   Base de datos de productos.
   Para agregar un producto nuevo: copia un objeto, cambia sus
   valores y guarda el archivo. El catálogo se actualiza solo.

   Campos:
     id        (número único)
     name      (string)
     gender    "hombre" | "mujer" | "ninos" | "unisex"
     category  (string visible al cliente)
     icon      "sneaker" | "boot" | "sandal" | "heel" | "loafer" | "kids"
     sizes     array de números
     price     precio base en COP (sin descuento)
     discount  % de descuento (0 = sin descuento)
     isNew     true | false
   ================================================================ */

const PRODUCTS = [
  { id: 1,  name: "Runner Aire Pro",      gender: "hombre", category: "Zapatillas", icon: "sneaker", sizes: [39,40,41,42,43,44],          price: 189000, discount: 20, isNew: false },
  { id: 2,  name: "Brisa Urbana",         gender: "mujer",  category: "Zapatillas", icon: "sneaker", sizes: [35,36,37,38,39,40],          price: 175000, discount: 0,  isNew: true  },
  { id: 3,  name: "Sendero Cuero",        gender: "hombre", category: "Botas",      icon: "boot",    sizes: [40,41,42,43,44,45],          price: 320000, discount: 15, isNew: false },
  { id: 4,  name: "Costa Tropical",       gender: "mujer",  category: "Sandalias",  icon: "sandal",  sizes: [35,36,37,38,39],             price: 98000,  discount: 0,  isNew: true  },
  { id: 5,  name: "Elegancia Charol",     gender: "mujer",  category: "Tacones",    icon: "heel",    sizes: [35,36,37,38,39,40],          price: 245000, discount: 30, isNew: false },
  { id: 6,  name: "Clásico Mocasín",      gender: "hombre", category: "Mocasines",  icon: "loafer",  sizes: [39,40,41,42,43],             price: 210000, discount: 0,  isNew: false },
  { id: 7,  name: "Pasitos Felices",      gender: "ninos",  category: "Infantil",   icon: "kids",    sizes: [28,29,30,31,32],             price: 85000,  discount: 0,  isNew: true  },
  { id: 8,  name: "Aventura Trail",       gender: "hombre", category: "Zapatillas", icon: "sneaker", sizes: [40,41,42,43,44,45],          price: 230000, discount: 0,  isNew: false },
  { id: 9,  name: "Flor de Verano",       gender: "mujer",  category: "Sandalias",  icon: "sandal",  sizes: [35,36,37,38,39,40],          price: 110000, discount: 10, isNew: false },
  { id: 10, name: "Bota Andina",          gender: "mujer",  category: "Botas",      icon: "boot",    sizes: [35,36,37,38,39],             price: 280000, discount: 0,  isNew: false },
  { id: 11, name: "Primer Paso",          gender: "ninos",  category: "Infantil",   icon: "kids",    sizes: [28,29,30,31],                price: 79000,  discount: 15, isNew: false },
  { id: 12, name: "Urbano Negro",         gender: "unisex", category: "Zapatillas", icon: "sneaker", sizes: [36,37,38,39,40,41,42,43,44], price: 165000, discount: 0,  isNew: true  },
  { id: 13, name: "Mocasín Suave",        gender: "mujer",  category: "Mocasines",  icon: "loafer",  sizes: [35,36,37,38,39],             price: 195000, discount: 0,  isNew: false },
  { id: 14, name: "Explorador Junior",    gender: "ninos",  category: "Zapatillas", icon: "sneaker", sizes: [30,31,32,33,34],             price: 99000,  discount: 0,  isNew: false },
  { id: 15, name: "Speed Elite",          gender: "hombre", category: "Zapatillas", icon: "sneaker", sizes: [39,40,41,42,43,44,45],       price: 275000, discount: 25, isNew: true  },
  { id: 16, name: "Noche de Gala",        gender: "mujer",  category: "Tacones",    icon: "heel",    sizes: [35,36,37,38,39],             price: 185000, discount: 0,  isNew: true  },
];

/* Utilidades compartidas */
function getFinalPrice(product) {
  if (!product.discount) return product.price;
  return Math.round(product.price * (1 - product.discount / 100));
}

function formatCOP(value) {
  return "$" + value.toLocaleString("es-CO");
}

function getGenderLabel(gender) {
  return { hombre: "Hombre", mujer: "Mujer", ninos: "Niños", unisex: "Unisex" }[gender] || gender;
}
