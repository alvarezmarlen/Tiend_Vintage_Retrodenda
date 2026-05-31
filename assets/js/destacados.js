/* import { articulosJSON } from './main.js';
 */
const url   ="https://backend-tienda-retrodenda.onrender.com/productos"
fetch(url)
    .then(Response => Response.json())
    .then(articulosJSON => { 

const productDestacadosList = document.getElementById('products-destacados');

const idsDestacados = [7, 14, 16, 18, 19];
const destacados = articulosJSON.filter(function(product) {
    return idsDestacados.includes(product.produtID)
});

// generamos las tarjetas
destacados.forEach(function(product)  {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';
    tarjeta.innerHTML = `
                    <div class="card-tarjeta">
                        <figure>
                            <img class="tarjeta-img" src="${product.imagen}" alt="${product.productName}">
                            <figcaption class="tarjeta-informacion">
                                <h5>${product.productName}</h5>
                                <p><strong>€ ${product.precio}</strong></p>
                                <button class="agregar" id="agregar-carrito">Agregar al carrito</button>
                            </figcaption>
                        </figure>
                    </div>   
    
    `;
 // Click en la tarjeta → ir al detalle
    tarjeta.querySelector('.card-tarjeta').addEventListener('click', function() {
        localStorage.setItem('productoSeleccionado', JSON.stringify(product));
        window.location.href = 'pages/detalle.html';
    });

    // Click en el botón → NO ir al detalle
    tarjeta.querySelector('.agregar').addEventListener('click', function(event) {
        event.stopPropagation();
        agregarAlCarritoYRedirigir(product);
        console.log('Producto para agregar:', product);
    });

    productDestacadosList.appendChild(tarjeta);
    });
})




// AQUÍ EMPIEZA LA PROPUESTA NUEVA DE FUNCIÓN


// Función para agregar al carrito
function agregarAlCarritoYRedirigir(product) {
// Intentamos obtener el carrito del localStorage. Si no existe, usamos "[]" para que JSON.parse no falle.
    let carritoData = localStorage.getItem("carrito");
    let carrito = JSON.parse(carritoData || "[]");
    
    let productoExiste = false;

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].productID === product.produtID) {

            // Si existe: Aumentar cantidad
            carrito[i].cantidad = carrito[i].cantidad + 1;
            
            // Verificar que no supere el stock
            if (carrito[i].cantidad > product.stock) {
                carrito[i].cantidad = product.stock; // Limitar al stock máximo
            }
            
            productoExiste = true;
            break; // Salir del bucle for, ya encontramos y actualizamos el producto
        }
    }
if (!productoExiste) {
        // Si no se encontró el producto en el bucle, lo agregamos como una nueva compra
        let Compra = {
            productID: product.produtID,
            categoria: product.categoria,
            productName: product.productName,
            imagen: product.imagen,
            precio: product.precio,
            descripcion: product.descripcion,
            talla: product.talla,
            stock: product.stock,
            cantidad: 1 // La cantidad inicial es 1
        };
        carrito.push(Compra);
    };
    
    // 4. GUARDAR Y REDIRIGIR
    // Guardar el array del carrito actualizado en localStorage (convertido a texto JSON)
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    // Redirigir al usuario
    window.location.href = 'pages/cart.html';
}