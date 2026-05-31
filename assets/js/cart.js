
let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

// Función para "normalizar" o "limpiar" el carrito para que funcione bien,
// debido a discordancias de nomenclaturas en las fuentes que guardan el carrito
// en el Local Storage (catálogo, detalle):

carrito = normalizarCarrito(carrito);
guardarCarrito();

// con este map, saca el 'id' de todos los items y lo convierte en un número común entre ellos:


function normalizarCarrito(carritoSinOrdenar) {
  const map = new Map();

    for (const item of (Array.isArray(carritoSinOrdenar) ? carritoSinOrdenar : [])) {
    const id = Number(item.productID ?? item.produtID ?? item.id);

    const cantidad = Number(item.cantidad);

    map.set(id, (map.get(id) ?? 0) + cantidad);
  }

  return [...map.entries()].map(([id, cantidad]) => ({
    produtID: id,
    cantidad
  }));
}

// FUNCIÓN PARA GUARDAR EL CARRITO EN LOCAL STORAGE, CONVIRTIENDO EL ARRAY ANTERIOR EN UN STRING JSON:

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}



// FUNCIÓN PARA RESOLVER DISCREPANCIAS ENTRE FORMATOS Y RUTAS DE LAS IMÁGENES:

function resolverImagen(path) {
  if (!path) return "";

  if (
    path.startsWith("http") ||
    path.startsWith("/") ||
    path.startsWith("../") ||
    path.startsWith("./")
  ) return path;

  if (!path.includes("assets")) return `../assets/${path}`;
  return `../${path}`;
}


// Sacar el 'id' sin importar cómo se llame la forma en que fue guardado en el origen:

function getId(item) {
  return Number(item.produtID);
}

// AQUÍ SE RECOGEN LOS ELEMENTOS DEL DOM:

const divisa = '€';
const DOMitems = document.querySelector('#cart-items');
const DOMtotal = document.querySelector('#total');
const DOMbotonVaciar = document.querySelector('#btn-empty');
const DOMbotonCheckout = document.querySelector('#btn-checkout');



// CALCULAR EL TOTAL, multiplicando precio por cantidad de cada item y ajustándolo a dos decimales:

function calcularTotal() {
  return carrito
    .reduce((acc, compra) => {
      const id = getId(compra);
      const producto = getProductoPorId(id);
      const precio = Number(producto.precio);
      return acc + precio * Number(compra.cantidad);
    }, 0)
    .toFixed(2);
}

// BOTONES DE COLUMNA IZQUIERDA (PRODUCTOS SELECCIONADOS):

// botón para aumentar (lee el id, busca la compra en carrito, y si hay stock disponible aumenta la cantidad en 1):

function aumentarCantidad(event) {
  const id = Number(event.target.dataset.id);
  if (!Number.isFinite(id)) return;

  const compra = carrito.find(i => getId(i) === id);
  if (!compra) return;

  const producto = getProductoPorId(id); 
  const stock = Number(producto?.stock ?? 999999);

  if (compra.cantidad < stock) {
    compra.cantidad++;
    guardarCarrito();
    renderizarCarrito();
  }
}

// botón para disminuir (lee el id, si la cantidad actual es mayor que 1 lo resta, si es 1 lo elimina):

function disminuirCantidad(event) {
  const id = Number(event.target.dataset.id);
  if (!Number.isFinite(id)) return;

  const compra = carrito.find(i => getId(i) === id);
  if (!compra) return;

  if (compra.cantidad > 1) {
    compra.cantidad--;
  } else {
    carrito = carrito.filter(i => getId(i) !== id);
  }

  guardarCarrito();
  renderizarCarrito();
}

// botón para eliminar el item completo:

function eliminarItem(event) {
  const id = Number(event.target.dataset.id);
  if (!Number.isFinite(id)) return;

  carrito = carrito.filter(i => getId(i) !== id);
  guardarCarrito();
  renderizarCarrito();
}

// BOTONES DE COLUMNA DERECHA (SUMARIO)

if (DOMbotonVaciar) {
  DOMbotonVaciar.addEventListener('click', () => {
    carrito = [];
    localStorage.removeItem('carrito');
    renderizarCarrito();
  });
}

if (DOMbotonCheckout) {
  DOMbotonCheckout.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    window.location.href = "/pages/checkout.html";
  });
}





// import { articulosJSON } from './main.js';

let catalogoActual = [];



const url="https://backend-tienda-retrodenda.onrender.com/productos"

fetch(url)
  .then(response => response.json())
  .then(articulosJSON => {
    catalogoActual = articulosJSON;
    renderizarCarrito();



  });


function getProductoPorId(id) {
  return catalogoActual.find(p => Number(p.produtID) === id);
}



// --- FUNCIÓN PARA RENDERIZAR: ---


function renderizarCarrito() {

// para que las cards del carrito desaparezcan cuando se vacíe:
 DOMitems.textContent = '';

// de cada producto ingresado en el carrito por el usuario obtiene el id, busca el producto real

  carrito.forEach((productoEnCarrito) => {
    const id = getId(productoEnCarrito);
    const producto = getProductoPorId(id);

    const nombre = producto.productName;
    const precio = Number(producto.precio);
    const stock = Number(producto.stock);
    const imagen = resolverImagen(producto.imagen);


// crea las tarjetas:

    const miProductoCard = document.createElement('div');
    miProductoCard.classList.add('cart-item');

    const miProductoName = document.createElement('h5');
    miProductoName.classList.add('cart-items-name');
    miProductoName.textContent = nombre;

    const miProductoImagen = document.createElement('img');
    miProductoImagen.classList.add('cart-items-image');
    miProductoImagen.setAttribute('src', imagen);
    miProductoImagen.setAttribute('alt', nombre);

    const miProductoPrecio = document.createElement('p');
    miProductoPrecio.classList.add('cart-items-precio');
    miProductoPrecio.textContent = `${precio.toFixed(2)}${divisa}`;

// Botones cantidad
    
    const btnRestar = document.createElement('button');
    btnRestar.textContent = '-';
    btnRestar.classList.add('quantity-button');
    btnRestar.dataset.id = String(id); // se usa 'dataset.id' para que el botón sepa qué producto está tocando, según su id.
    btnRestar.addEventListener('click', disminuirCantidad);
    
    const btnSumar = document.createElement('button');
    btnSumar.textContent = '+';
    btnSumar.classList.add('quantity-button');
    btnSumar.dataset.id = String(id);
    btnSumar.addEventListener('click', aumentarCantidad);

    const cantidadEnCarrito = document.createElement('span');
    cantidadEnCarrito.textContent = String(productoEnCarrito.cantidad);
    cantidadEnCarrito.classList.add('quantity-display');

// Subtotal: se calcula con precio desde main.js
    const miProductoSubtotal = document.createElement('p');
    miProductoSubtotal.classList.add('item-subtotal');
    miProductoSubtotal.textContent =
     (precio * Number(productoEnCarrito.cantidad)).toFixed(2) + ` ${divisa}`;

// Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar del carrito';
    btnEliminar.classList.add('remove-btn');
    btnEliminar.dataset.id = String(id);
    btnEliminar.addEventListener('click', eliminarItem);

// Montaje
    miProductoCard.appendChild(miProductoImagen);
    miProductoCard.appendChild(miProductoName);
    miProductoCard.appendChild(miProductoPrecio);

    miProductoCard.appendChild(btnRestar);
    miProductoCard.appendChild(cantidadEnCarrito);
    miProductoCard.appendChild(btnSumar);

    miProductoCard.appendChild(miProductoSubtotal);
    miProductoCard.appendChild(btnEliminar);

    DOMitems.appendChild(miProductoCard);

// Evitar que alguien supere stock si stock existe:
    if (Number(productoEnCarrito.cantidad) > stock) {
      productoEnCarrito.cantidad = stock;
      guardarCarrito();
      cantidadEnCarrito.textContent = String(productoEnCarrito.cantidad);
      miProductoSubtotal.textContent =
        (precio * Number(productoEnCarrito.cantidad)).toFixed(2) + ` ${divisa}`;
    }
  });

  DOMtotal.textContent = calcularTotal();
}









/*



// FALTA CAMBIAR LA RUTA DE "ALIMENTACIÓN DE DATOS" 
// QUE ACTUALMENTE ESTÁ EN EL LOCAL SERVER Y DEBE PASAR AL ENPOINT GENERADO EN EL BACKEND


import { articulosJSON } from './main.js';


// Al abrir la página, se lee el carrito que ya está guardado en Local Storage,
// y pasa de ser un JSON a ser un array de JavaScript:

let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

// Función para "normalizar" o "limpiar" el carrito para que funcione bien,
// debido a discordancias de nomenclaturas en las fuentes que guardan el carrito
// en el Local Storage (catálogo, detalle):

carrito = normalizarCarrito(carrito);
guardarCarrito();

// con este map, saca el 'id' de todos los items y lo convierte en un número común entre ellos:


function normalizarCarrito(carritoSinOrdenar) {
  const map = new Map();

    for (const item of (Array.isArray(carritoSinOrdenar) ? carritoSinOrdenar : [])) {
    const id = Number(item.productID ?? item.produtID ?? item.id);

    const cantidad = Number(item.cantidad);

    map.set(id, (map.get(id) ?? 0) + cantidad);
  }

  return [...map.entries()].map(([id, cantidad]) => ({
    produtID: id,
    cantidad
  }));
}

// FUNCIÓN PARA GUARDAR EL CARRITO EN LOCAL STORAGE, CONVIRTIENDO EL ARRAY ANTERIOR EN UN STRING JSON:

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// PARA CONECTAR EL CARRITO CON EL CATÁLOGO:

// Sacar el 'id' sin importar cómo se llame la forma en que fue guardado en el origen:

function getId(item) {
  return Number(item.produtID);
}

// Buscar el producto real en articulosJSON, es decir, buscar en el catálogo el objeto que tenga ese id:

function getProductoPorId(id) {
  return articulosJSON.find(p => Number(p.produtID) === id);
}



// FUNCIÓN PARA RESOLVER DISCREPANCIAS ENTRE FORMATOS Y RUTAS DE LAS IMÁGENES:

function resolverImagen(path) {
  if (!path) return "";

  if (
    path.startsWith("http") ||
    path.startsWith("/") ||
    path.startsWith("../") ||
    path.startsWith("./")
  ) return path;

  if (!path.includes("assets")) return `../assets/${path}`;
  return `../${path}`;
}


// AQUÍ SE RECOGEN LOS ELEMENTOS DEL DOM:

const divisa = '€';
const DOMitems = document.querySelector('#cart-items');
const DOMtotal = document.querySelector('#total');
const DOMbotonVaciar = document.querySelector('#btn-empty');
const DOMbotonCheckout = document.querySelector('#btn-checkout');



// --- RENDERIZAR: ---


function renderizarCarrito() {

// acá vacía el contenedor, para que no se dupliquen productos al volver a renderizar:
  DOMitems.textContent = '';

// de cada producto ingresado en el carrito por el usuario obtiene el id, busca el producto real
// y crea una tarjeta (div)

  carrito.forEach((productoEnCarrito) => {
    const id = getId(productoEnCarrito);
    const producto = getProductoPorId(id);

// esto pone un nombre y precio seguros si el producto no está en el catálogo, para no romper las operaciones de los botones:
    const nombre = producto.productName;
    const precio = Number(producto.precio);
    
 // si acaso no se establece un stock, se asume uno enorme para no bloquear las sumas:
    const stock = Number(producto.stock);


  // acá se activa la resolución de conflictos en origen de imágenes de productos:
    const imagen = resolverImagen(producto.imagen);

  // crea las tarjetas:
    const miProductoCard = document.createElement('div');
    miProductoCard.classList.add('cart-item');

    const miProductoName = document.createElement('h5');
    miProductoName.classList.add('cart-items-name');
    miProductoName.textContent = nombre;

    const miProductoImagen = document.createElement('img');
    miProductoImagen.classList.add('cart-items-image');
    miProductoImagen.setAttribute('src', imagen);
    miProductoImagen.setAttribute('alt', nombre);

    const miProductoPrecio = document.createElement('p');
    miProductoPrecio.classList.add('cart-items-precio');
    miProductoPrecio.textContent = `${precio.toFixed(2)}${divisa}`;

    // Botones cantidad
    
    const btnRestar = document.createElement('button');
    btnRestar.textContent = '-';
    btnRestar.classList.add('quantity-button');
    btnRestar.dataset.id = String(id); // se usa 'dataset.id' para que el botón sepa qué producto está tocando, según su id.
    btnRestar.addEventListener('click', disminuirCantidad);
    
    const btnSumar = document.createElement('button');
    btnSumar.textContent = '+';
    btnSumar.classList.add('quantity-button');
    btnSumar.dataset.id = String(id);
    btnSumar.addEventListener('click', aumentarCantidad);

    const cantidadEnCarrito = document.createElement('span');
    cantidadEnCarrito.textContent = String(productoEnCarrito.cantidad);
    cantidadEnCarrito.classList.add('quantity-display');

    // Subtotal: se calcula con precio desde main.js
    const miProductoSubtotal = document.createElement('p');
    miProductoSubtotal.classList.add('item-subtotal');
    miProductoSubtotal.textContent =
     (precio * Number(productoEnCarrito.cantidad)).toFixed(2) + ` ${divisa}`;

    // Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar del carrito';
    btnEliminar.classList.add('remove-btn');
    btnEliminar.dataset.id = String(id);
    btnEliminar.addEventListener('click', eliminarItem);

    // Montaje
    miProductoCard.appendChild(miProductoImagen);
    miProductoCard.appendChild(miProductoName);
    miProductoCard.appendChild(miProductoPrecio);

    miProductoCard.appendChild(btnRestar);
    miProductoCard.appendChild(cantidadEnCarrito);
    miProductoCard.appendChild(btnSumar);

    miProductoCard.appendChild(miProductoSubtotal);
    miProductoCard.appendChild(btnEliminar);

    DOMitems.appendChild(miProductoCard);

    // Evitar que alguien supere stock si stock existe:
    if (Number(productoEnCarrito.cantidad) > stock) {
      productoEnCarrito.cantidad = stock;
      guardarCarrito();
      cantidadEnCarrito.textContent = String(productoEnCarrito.cantidad);
      miProductoSubtotal.textContent =
        (precio * Number(productoEnCarrito.cantidad)).toFixed(2) + ` ${divisa}`;
    }
  });

  DOMtotal.textContent = calcularTotal();
}

// CALCULAR EL TOTAL, multiplicando precio por cantidad de cada item y ajustándolo a dos decimales:

function calcularTotal() {
  return carrito
    .reduce((acc, compra) => {
      const id = getId(compra);
      const producto = getProductoPorId(id);
      const precio = Number(producto.precio);
      return acc + precio * Number(compra.cantidad);
    }, 0)
    .toFixed(2);
}

// BOTONES DE COLUMNA IZQUIERDA (PRODUCTOS SELECCIONADOS):

// botón para aumentar (lee el id, busca la compra en carrito, y si hay stock disponible aumenta la cantidad en 1):

function aumentarCantidad(event) {
  const id = Number(event.target.dataset.id);
  if (!Number.isFinite(id)) return;

  const compra = carrito.find(i => getId(i) === id);
  if (!compra) return;

  const producto = getProductoPorId(id); 
  const stock = Number(producto?.stock ?? 999999);

  if (compra.cantidad < stock) {
    compra.cantidad++;
    guardarCarrito();
    renderizarCarrito();
  }
}

// botón para disminuir (lee el id, si la cantidad actual es mayor que 1 lo resta, si es 1 lo elimina):

function disminuirCantidad(event) {
  const id = Number(event.target.dataset.id);
  if (!Number.isFinite(id)) return;

  const compra = carrito.find(i => getId(i) === id);
  if (!compra) return;

  if (compra.cantidad > 1) {
    compra.cantidad--;
  } else {
    carrito = carrito.filter(i => getId(i) !== id);
  }

  guardarCarrito();
  renderizarCarrito();
}

// botón para eliminar el item completo:

function eliminarItem(event) {
  const id = Number(event.target.dataset.id);
  if (!Number.isFinite(id)) return;

  carrito = carrito.filter(i => getId(i) !== id);
  guardarCarrito();
  renderizarCarrito();
}

// BOTONES DE COLUMNA DERECHA (SUMARIO)

if (DOMbotonVaciar) {
  DOMbotonVaciar.addEventListener('click', () => {
    carrito = [];
    localStorage.removeItem('carrito');
    renderizarCarrito();
  });
}

if (DOMbotonCheckout) {
  DOMbotonCheckout.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    window.location.href = "/pages/checkout.html";
  });
}

// --- RENDERIZAR --- 

renderizarCarrito();

*/