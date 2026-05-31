/* Esta parte permite que los productos que estan en database.Json  
 se plasmen en la pagina Panel de Administracion en la tabla, 
 exactamente en el cuerpo de la tabla */
const url = "https://backend-tienda-retrodenda.onrender.com/productos";
const DOMitems = document.querySelector(".productos-items");

let productos = [];

fetch(url)
  .then(res => res.json())
  .then(data => {
    productos = data; 
    pintarProductos();
  })
  .catch(function(error) {
    console.log(error);
  });

function pintarProductos() {
  DOMitems.innerHTML = ""; 


  //FUNCIÓN PARA ORDENAR LOS PRODUCTOS POR ID
    productos.sort((a, b) => {
    return Number(a.produtID) - Number(b.produtID);
  });

 

  productos.forEach(function(producto) {
    const fila = document.createElement("tr");  

    fila.innerHTML = `
      <td><img src="${producto.imagen}" alt="${producto.productName}" width="80"></td>
      <td>${producto.produtID}</td>
      <td class="descrip">${producto.productName}</td>
      <td class="descrip">${producto.descripcion}</td>
      <td>${producto.categoria}</td>
      <td>${producto.precio} €</td>
      <td>${producto.talla}</td>
      <td>${producto.stock}</td>
      <td class="acciones">
      <button class="editar">Editar</button>
      <button class="eliminar">Eliminar</button>
      </td>
    `;

/* -----------------------------------------------------------------------------------------------------------------------

                EDITAR
------------------------------------------------------------------------------------------------------------------------*/
   const btnEditar = fila.querySelector('.editar');

    btnEditar.addEventListener("click", function(){  
        const modal = document.getElementById("myModal");
        modal.style.display = 'block';

        document.getElementById("id-oculto").value = producto.id;
        document.getElementById("productID").value = producto.produtID;
        document.getElementById("categoria").value = producto.categoria;
        document.getElementById("productName").value = producto.productName;
        document.getElementById("descripcion").value = producto.descripcion;
        document.getElementById("precio").value = producto.precio;
        document.getElementById("talla").value = producto.talla;
        document.getElementById("stock").value = producto.stock;
        document.getElementById("imagen").value = producto.imagen;
        // Cambiamos el texto del título para saber que estamos editando
        document.querySelector(".agregar-producto h3").innerText = "Editar Producto";
    });




 /* -----------------------------------------------------------------------------------------------------------------------

                BORRAR/ELIMINAR
------------------------------------------------------------------------------------------------------------------------*/
    
    const btnEliminar = fila.querySelector('.eliminar');
    
    btnEliminar.addEventListener("click", function()  {
      if (confirm(`¿Borrar ${producto.descripcion}?`)) {
        fetch(`https://backend-tienda-retrodenda.onrender.com/productos/${producto.id}`, {
          method: 'DELETE'
        })
        .then(() => {
          fila.remove(); 
          alert("Producto eliminado");
        });
      }
    });  
      
    DOMitems.appendChild(fila);
  });
} 



/* -------------------------------------------------------------------
    aqui funciona la modal que se muestra al dar click al BOTON CREAR
    ------------------------------------------------------------------*/
let modal = document.getElementById("myModal");
let abrir = document.getElementById("abrirModal");
let cerrar = document.querySelector(".cerrar-modal");
let cancelar = document.getElementById("cancelBtn");
let guardar = document.getElementById("guardarBtn");

// Mostrar modal
abrir.addEventListener("click", function() {
  modal.style.display = "flex";
});

// Cerrar con la X
cerrar.addEventListener("click", function() {
  modal.style.display = "none";
});

// Cerrar con Cancelar
cancelar.addEventListener("click", function() {
  modal.style.display = "none";
});

// Guardar
guardar.addEventListener("click", function() {
  modal.style.display = "none";
});



 /* -----------------------------------------------------------------------------------------------------------------------

                AGREGAR PRODUCTOS
------------------------------------------------------------------------------------------------------------------------*/
function insertar() {
  // 1. RECOGEMOS EL ID OCULTO (El bolsillo secreto)
  const idEditar = document.getElementById("id-oculto").value;

/* declaro  const para preguntar si los valores cumplen y asi 
no me guarde un producto vacio.
*/
  const numeroId = document.getElementById("productID").value;
  const nombreDelProducto = document.getElementById("productName").value;
  const precioDelProducto = document.getElementById("precio").value;

/* Luego le pregunto con el IF si cumplen */
      if (numeroId==="" || nombreDelProducto ==="" || precioDelProducto ==="") {
        alert("Debes de llenar los campos");
        return; // Detiene todo, si no lo coloco pasa a crear producto vacio
      }
  
  const agregarProducto = {
    produtID: document.getElementById("productID").value,
    categoria: document.getElementById("categoria").value,
    productName: document.getElementById("productName").value,
    descripcion: document.getElementById("descripcion").value,
    precio: document.getElementById("precio").value,
    talla: document.getElementById("talla").value,
    stock: document.getElementById("stock").value,
    imagen: document.getElementById("imagen").value
  };

// 🔑 AQUÍ ESTÁ LA CLAVE
  let url2 = "https://backend-tienda-retrodenda.onrender.com/productos";
  let method = "POST"; // crear por defecto

  if (idEditar) {
    url2 = `https://backend-tienda-retrodenda.onrender.com/productos/${idEditar}`;
    method = "PUT"; // editar
  }

  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agregarProducto),
  };


    fetch(url2, options)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      alert(idEditar ? "Producto actualizado" : "Producto agregado");
      location.reload();
    }) ;
}