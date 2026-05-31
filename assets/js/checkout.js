
// 1. CATÁLOGO: En lugar de importación estática, lo cargamos dinámicamente

let articulosJSON = [];

// Función para cargar productos desde JSON server
function cargarProductosDesdeServer() {
  return fetch("https://backend-tienda-retrodenda.onrender.com/productos")
    .then(response => {
      if (!response.ok) throw new Error("Error al cargar productos");
      return response.json();
    })
    .then(productos => {
      articulosJSON = productos;
      return productos;
    })
    .catch(error => {
      console.error("Error cargando productos:", error);
      return [];
    });
}


//  2. DOM: TOMAMOS LOS ELEMENTOS QUE YA ESTÁN EN EL HTML

const form = document.getElementById("formCompra");
const resumen = document.getElementById("cart-order");
const erroresBox = document.getElementById("checkout-errors");
const paymentSection = document.getElementById("payment");


//  3. MOSTRAR U OCULTAR SI EXISTEN ERRORES DE LLENADO EN LOS INPUTS DE FORMULARIO

function mostrarErrores(mensajes) {
  if (!erroresBox) return;

  if (!mensajes || mensajes.length === 0) {
    erroresBox.classList.remove("is-visible");
    erroresBox.innerHTML = "";
    return;
  }

  erroresBox.classList.add("is-visible");
  erroresBox.innerHTML = `
    <strong>Revisa esto:</strong>
    <ul>
      ${mensajes.map(m => `<li>${m}</li>`).join("")}
    </ul>
  `;
}

//   3. CARRITO: LEERLO Y NORMALIZAR EN UN FORMATO ÚNICO:

   function leerCarritoRaw() {
  return JSON.parse(localStorage.getItem("carrito") || "[]");
}

function normalizarCarrito(raw) {
  // Convierte cualquier formato a: [{ id, cantidad }]
  // y suma cantidades si hay el mismo producto repetido.
  const map = new Map(); // id -> cantidad

  const lista = Array.isArray(raw) ? raw : [];
  for (const item of lista) {
    const id = Number(item.productID ?? item.produtID ?? item.id);
    if (!Number.isFinite(id)) continue;

    const cantidad = Number(item.cantidad ?? 1);
    const cantidadSegura = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1;

    map.set(id, (map.get(id) ?? 0) + cantidadSegura);
  }

  return [...map.entries()].map(([id, cantidad]) => ({ id, cantidad }));
}

// 4. CATÁLOGO: BUSCAR PRODUCTO REAL USANDO ID:

function getProductoPorId(id) {
  return articulosJSON.find(p => Number(p.produtID ?? p.productID) === Number(id));
}

//   5. PEDIDO: CONSTURIR LÍNEAS + TOTAL + ERRORES

function construirPedido(carritoMinimo) {
  const errores = [];
  const lineas = [];

  for (const item of carritoMinimo) {
    const producto = getProductoPorId(item.id);

    if (!producto) {
      errores.push(`No se encontró el producto con id ${item.id} en el catálogo.`);
      continue;
    }

    const nombre = producto.productName ?? `Producto #${item.id}`;
    const precio = Number(producto.precio ?? 0);
    const stock = Number(producto.stock ?? 0);
    const cantidad = Number(item.cantidad ?? 1);

    if (!Number.isFinite(precio)) {
      errores.push(`Precio inválido para "${nombre}".`);
      continue;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      errores.push(`Cantidad inválida para "${nombre}".`);
      continue;
    }

    // Versión simple: si supera stock -> BLOQUEAMOS (no ajustamos)
    if (Number.isFinite(stock) && stock > 0 && cantidad > stock) {
      errores.push(`"${nombre}": pediste ${cantidad}, pero solo hay ${stock} en stock.`);
      continue;
    }

    lineas.push({
      id: item.id,
      nombre,
      precio,
      cantidad,
      subtotal: precio * cantidad
    });
  }

  const total = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  return { errores, lineas, total };
}

// 6. RESUMEN (PINTAR EN PANTALLA)

function renderResumen(lineas, total) {
  if (!resumen) return;

  resumen.innerHTML = `<p>Resumen de tu compra</p>`;

  if (!lineas || lineas.length === 0) {
    resumen.innerHTML += `<p>Tu carrito está vacío.</p>`;
    return;
  }

  for (const l of lineas) {
    resumen.innerHTML += `
      <div class="order-item">
        <span>${l.nombre} x ${l.cantidad}</span>
        <span>${l.subtotal.toFixed(2)} €</span>
      </div>
    `;
  }

  resumen.innerHTML += `
    <div class="order-total">
      <span>Total</span>
      <span>${total.toFixed(2)} €</span>
    </div>
  `;
}

// 7. PAGO (ASEGURAR RADIOS + LEER SELECCIÓN)

function asegurarOpcionesDePago() {
  if (!paymentSection) return;

  const yaHay = paymentSection.querySelector('input[type="radio"][name="paymentMethod"]');
  if (yaHay) return;

  paymentSection.innerHTML = `
    <p>Pasarelas de pago</p>

    <label style="display:block; margin: 8px 0;">
      <input type="radio" name="paymentMethod" value="tarjeta">
      Tarjeta
    </label>

    <label style="display:block; margin: 8px 0;">
      <input type="radio" name="paymentMethod" value="bizum">
      Bizum
    </label>

    <label style="display:block; margin: 8px 0;">
      <input type="radio" name="paymentMethod" value="paypal">
      PayPal
    </label>
  `;
}

function obtenerMetodoPago() {
  const radio = document.querySelector('input[type="radio"][name="paymentMethod"]:checked');
  return radio ? radio.value : null;
}

// 8. FORMULARIO: LEER Y VALIDAR DATOS:


   function leerDatosFormulario() {
  return {
    nombre: document.getElementById("nombre")?.value.trim() || "",
    apellido: document.getElementById("apellido")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    telefono: document.getElementById("telefono")?.value.trim() || "",
    pais: document.getElementById("pais")?.value.trim() || "",
    direccion: document.getElementById("direccion")?.value.trim() || "",
    ciudad: document.getElementById("ciudad")?.value.trim() || "",
    cp: document.getElementById("zipcode")?.value.trim() || "",
    provincia: document.getElementById("provincia")?.value.trim() || "",
  };
}

function validarFormulario(data, metodoPago) {
  const errores = [];

  if (!data.nombre) errores.push("Falta el nombre.");
  if (!data.apellido) errores.push("Falta el apellido.");
  if (!data.email) errores.push("Falta el email.");

  // Validación MUY básica de email
  if (data.email && (!data.email.includes("@") || !data.email.includes("."))) {
    errores.push("El email no parece válido.");
  }

  if (!data.pais) errores.push("Falta el país/región.");
  if (!data.direccion) errores.push("Falta la dirección.");
  if (!data.ciudad) errores.push("Falta la ciudad.");
  if (!data.cp) errores.push("Falta el código postal.");
  if (!data.provincia) errores.push("Falta la provincia.");

  if (!metodoPago) errores.push("Selecciona un método de pago.");

  return errores;
}
// 9. CONFIRMACIÓN DE PEDIDO

function confirmarPedido(pedido, dataCliente, metodoPago) {
  const pedidoFinal = {
    idPedido: Date.now(),
    fecha: new Date().toISOString(),
    metodoPago,
    cliente: dataCliente,
    items: pedido.lineas,
    total: pedido.total
  };

  localStorage.setItem("ultimoPedido", JSON.stringify(pedidoFinal));
  localStorage.removeItem("carrito");
}

//   10. FLUJO PRINCIPAL

asegurarOpcionesDePago();

function cargarCheckout() {
  mostrarErrores([]);

   // AHORA CARGAMOS LOS PRODUCTOS DESDE EL SERVIDOR
  cargarProductosDesdeServer()
    .then(() => {
      const raw = leerCarritoRaw();
      const carritoMinimo = normalizarCarrito(raw);

      const pedido = construirPedido(carritoMinimo);
      renderResumen(pedido.lineas, pedido.total);

      // Si hay errores del pedido (producto no existe / stock insuficiente)
      // los mostramos, pero NO confirmamos nada todavía.
      if (pedido.errores.length > 0) {
        mostrarErrores(pedido.errores);
      }
    })
    .catch(error => {
      console.error("Error al cargar el checkout:", error);
      mostrarErrores(["Error al cargar los productos. Por favor, intenta de nuevo."]);
    });
}

cargarCheckout();

// 12. SUBMIT, EFECTUACIÓN DEL PAGO

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  // RECARGAR PRODUCTOS ANTES DE PROCESAR EL PAGO
  cargarProductosDesdeServer()
    .then(() => {
      const mensajes = [];

      // 1) Pedido
      const carritoMinimo = normalizarCarrito(leerCarritoRaw());
      if (carritoMinimo.length === 0) {
        mensajes.push("Tu carrito está vacío.");
      }

      const pedido = construirPedido(carritoMinimo);
      mensajes.push(...pedido.errores);

      // 2) Formulario + método de pago
      const metodoPago = obtenerMetodoPago();
      const dataCliente = leerDatosFormulario();
      mensajes.push(...validarFormulario(dataCliente, metodoPago));

      // 3) Si hay problemas, mostrar y parar
      if (mensajes.length > 0) {
        mostrarErrores(mensajes);
        return;
      }

      // 4) Confirmar (simulado)
      confirmarPedido(pedido, dataCliente, metodoPago);

      alert(`¡Pedido confirmado! Total: ${pedido.total.toFixed(2)} €`);
      window.location.href = "/pages/productos.html";
    })
    .catch(error => {
      console.error("Error al procesar el pago:", error);
      mostrarErrores(["Error al procesar el pedido. Por favor, intenta de nuevo."]);
    });
});