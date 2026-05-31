const url="https://backend-tienda-retrodenda.onrender.com/productos"

fetch(url)
  .then(response => response.json())
  .then(articulosJSON => {
   


/* accedemos al boton por id y añadimos un escuchador*/
const botonf = document.getElementById("botonfiltro");
botonf.addEventListener("click", obtenerValor);


/* filtramos articulosJson */
function obtenerValor() {
   
    const selectElement  = document.getElementById("categoria");

    let valorSeleccionado = selectElement.value;


    const articulosfiltrados = articulosJSON.filter(filtrado);
    function filtrado(articulo) {
        if (valorSeleccionado=="todas"){ return true} else{
        return articulo.categoria == valorSeleccionado;}
    }  



// obtenemos el elemento contenedor por su id
const productList = document.getElementById('container');

// sobreescribimos lo que haya dentro
productList.innerHTML="";

// generamos las tarjetas
articulosfiltrados.forEach((product, index) => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
                    <div class="card">
                        <figure>
                            <img class="caja-img" src="${product.imagen}" alt="${product.productName}">
                            <figcaption class="caja-informacion">
                                <h5>${product.productName}</h5>
                                <p><strong>€ ${product.precio}</strong></p>
                                <button class="agregar" id="agregar-carrito">Agregar al carrito</button>
                            </figcaption>
                        </figure>
                    </div>   
    
    `;
    // añadimos un escuchador a la tarjeta y al hacer click almacenamos el producto en localstorage
    col.querySelector('.card').addEventListener('click', () => {
        localStorage.setItem('productoSeleccionado', JSON.stringify(product));
        window.location.href = 'detalle.html'; 
    });

    //añadimos las tarjetas al contenedor
    productList.appendChild(col);
});

}



  });
