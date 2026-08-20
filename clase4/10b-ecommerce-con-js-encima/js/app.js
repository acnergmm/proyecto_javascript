// ==========================================================
// TECNOSTORE - VERSION 2: JAVASCRIPT ENCIMA DEL HTML QUE YA EXISTE
// ==========================================================
// LA REGLA DE ESTE ARCHIVO:
// no fabricamos ni una sola tarjeta de producto.
// Las 8 ya estan escritas en el index.html.
// Nuestro trabajo es BUSCARLAS y hacerlas funcionar.
//
// Es la situacion mas comun en un trabajo real: te dan un
// HTML terminado y tenes que darle vida sin romperlo.
// ==========================================================


// ----------------------------------------------------------
// PASO 1 - Buscar lo que ya existe en la pagina
// ----------------------------------------------------------
const grilla = document.querySelector("#grilla");
const filtros = document.querySelector("#filtros");
const buscador = document.querySelector("#buscador");
const subtitulo = document.querySelector("#subtitulo");
const sinResultados = document.querySelector("#sin-resultados");

const carritoItems = document.querySelector("#carrito-items");
const carritoVacio = document.querySelector("#carrito-vacio");
const totales = document.querySelector("#totales");
const globo = document.querySelector("#globo");
const botonComprar = document.querySelector("#btn-comprar");

// ACA ESTA LA DIFERENCIA CON LA VERSION 3.
// No tenemos un array de productos escrito por nosotros:
// le pedimos al HTML que nos de los que ya tiene.
const tarjetas = document.querySelectorAll(".producto");

// Reglas del negocio
const COSTO_ENVIO = 35000;
const ENVIO_GRATIS_DESDE = 1000000;


// ----------------------------------------------------------
// PASO 2 - El estado
// ----------------------------------------------------------
let carrito = [];
let categoriaActiva = "todos";
let busqueda = "";


// Ayudita para mostrar los precios con los puntos de miles
const conPuntos = (numero) => `₲${numero.toLocaleString("es-PY")}`;


// ----------------------------------------------------------
// PASO 3 - Filtrar SIN borrar nada
// ----------------------------------------------------------
// La version 3 vuelve a dibujar la grilla entera.
// Esta version no puede: si borrara la grilla, perderiamos
// las tarjetas escritas a mano y no habria como recuperarlas.
//
// Entonces hacemos lo unico que se puede hacer con HTML que
// ya existe: MOSTRAR y ESCONDER con classList.

const aplicarFiltros = () => {
    let visibles = 0;

    tarjetas.forEach((tarjeta) => {

        // dataset lee los atributos data- del HTML.
        // data-categoria  ->  tarjeta.dataset.categoria
        // data-nombre     ->  tarjeta.dataset.nombre
        const categoria = tarjeta.dataset.categoria;
        const nombre = tarjeta.dataset.nombre.toLowerCase();

        // Tiene que cumplir las DOS condiciones a la vez
        const pasaCategoria = categoriaActiva === "todos" || categoria === categoriaActiva;
        const pasaBusqueda = nombre.includes(busqueda.toLowerCase());
        const seMuestra = pasaCategoria && pasaBusqueda;

        // toggle con segundo argumento: si es true agrega la clase,
        // si es false la saca. Nos ahorra el if/else.
        tarjeta.classList.toggle("oculto", !seMuestra);

        if (seMuestra) visibles++;
    });

    // El subtitulo se cuenta solo
    subtitulo.textContent = visibles === tarjetas.length
        ? `${tarjetas.length} productos disponibles`
        : `Mostrando ${visibles} de ${tarjetas.length} productos`;

    sinResultados.classList.toggle("oculto", visibles > 0);
};


// ----------------------------------------------------------
// PASO 4 - El carrito SI se fabrica
// ----------------------------------------------------------
// Los productos del carrito no existen en el HTML: aparecen
// cuando el usuario los elige. Esos si hay que crearlos.

const dibujarCarrito = () => {

    carritoItems.innerHTML = carrito.map((item) => `
        <li>
            <span class="nombre">${item.nombre}</span>
            <span class="subtotal">${conPuntos(item.precio * item.cantidad)}</span>
            <div class="cantidad">
                <button data-accion="restar" data-id="${item.id}">−</button>
                <span>${item.cantidad}</span>
                <button data-accion="sumar" data-id="${item.id}">+</button>
            </div>
            <button class="quitar" data-accion="quitar" data-id="${item.id}">✕</button>
        </li>
    `).join("");

    // --- Los totales, calculados ---
    // reduce recorre y va acumulando. Es el for de siempre, en una linea.
    const subtotal = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const envio = subtotal >= ENVIO_GRATIS_DESDE || subtotal === 0 ? 0 : COSTO_ENVIO;

    document.querySelector("#subtotal").textContent = conPuntos(subtotal);
    document.querySelector("#envio").textContent = envio === 0 ? "¡Gratis!" : conPuntos(envio);
    document.querySelector("#total").textContent = conPuntos(subtotal + envio);

    // El globito cuenta unidades, no productos distintos
    globo.textContent = carrito.reduce((suma, item) => suma + item.cantidad, 0);

    const vacio = carrito.length === 0;
    carritoVacio.classList.toggle("oculto", !vacio);
    totales.classList.toggle("oculto", vacio);
    botonComprar.disabled = vacio;
};


// ----------------------------------------------------------
// PASO 5 - Agregar, sumar, restar, quitar
// ----------------------------------------------------------

const agregarAlCarrito = (tarjeta) => {

    // Leemos los datos del HTML de la tarjeta.
    // dataset SIEMPRE devuelve texto, por eso el Number en el precio.
    const id = Number(tarjeta.dataset.id);
    const nombre = tarjeta.dataset.nombre;
    const precio = Number(tarjeta.dataset.precio);

    const enCarrito = carrito.find((item) => item.id === id);

    if (enCarrito) {
        enCarrito.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    dibujarCarrito();
};

const cambiarCantidad = (id, cuanto) => {
    const item = carrito.find((item) => item.id === id);
    if (!item) return;

    item.cantidad += cuanto;

    if (item.cantidad < 1) {
        quitarDelCarrito(id);
        return;
    }

    dibujarCarrito();
};

const quitarDelCarrito = (id) => {
    carrito = carrito.filter((item) => item.id !== id);
    dibujarCarrito();
};


// ----------------------------------------------------------
// PASO 6 - Los eventos
// ----------------------------------------------------------

// --- Botones "Agregar al carrito" ---
// Un solo listener en la grilla en lugar de 8 listeners sueltos.
// Se llama DELEGACION.
//   evento.target        -> lo que se clickeo exactamente
//   .closest(".producto") -> subimos hasta la tarjeta que lo contiene
grilla.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton");
    if (!boton) return;

    const tarjeta = boton.closest(".producto");
    agregarAlCarrito(tarjeta);
});

// --- Botones del carrito ---
carritoItems.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;

    const id = Number(boton.dataset.id);

    if (boton.dataset.accion === "sumar") cambiarCantidad(id, 1);
    if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
    if (boton.dataset.accion === "quitar") quitarDelCarrito(id);
});

// --- Filtros por categoria ---
filtros.addEventListener("click", (evento) => {
    const chip = evento.target.closest(".chip");
    if (!chip) return;

    // Los filtros son <a href="#">, y un <a> quiere navegar.
    // Este es el MISMO preventDefault del submit de los formularios.
    evento.preventDefault();

    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("activo"));
    chip.classList.add("activo");

    categoriaActiva = chip.dataset.categoria;
    aplicarFiltros();
});

// --- Buscador, filtrando mientras escribe ---
buscador.addEventListener("input", () => {
    busqueda = buscador.value.trim();
    aplicarFiltros();
});

// --- Finalizar compra ---
botonComprar.addEventListener("click", () => {
    const subtotal = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;

    alert(`Gracias por tu compra!\n\nTotal: ${conPuntos(subtotal + envio)}`);

    carrito = [];
    dibujarCarrito();
});

document.querySelector("#btn-carrito").addEventListener("click", () => {
    document.querySelector(".carrito").scrollIntoView({ behavior: "smooth" });
});


// ----------------------------------------------------------
// PASO 7 - Arrancar
// ----------------------------------------------------------
aplicarFiltros();
dibujarCarrito();


// ==========================================================
// LO QUE ESTA VERSION ARREGLO
//
//   Buscador          antes adorno   ->  ahora filtra en vivo
//   Filtros           antes muertos  ->  ahora funcionan
//   Botones Agregar   antes nada     ->  ahora suman al carrito
//   Cantidades        antes fijas    ->  ahora suben y bajan
//   Totales           a mano         ->  siempre correctos
//   Contador          escrito a mano ->  se cuenta solo
//
//
// LO QUE ESTA VERSION *NO* ARREGLO   <- la pregunta de la clase
//
// Mira una tarjeta cualquiera del index.html:
//
//     data-nombre="Mouse inalámbrico"     <- para el JavaScript
//     <h3>Mouse inalámbrico</h3>          <- para el humano
//
//     data-precio="75000"                 <- para el JavaScript
//     <span class="precio">₲75.000</span> <- para el humano
//
// El nombre y el precio estan escritos DOS VECES.
// Si cambias uno y te olvidas del otro, la pagina muestra
// un precio y te cobra otro. Y nadie se da cuenta.
//
// Ademas cada producto nuevo sigue costando 12 lineas de HTML.
//
// La pregunta que abre la version 3:
//   si el HTML ya tiene que guardar los datos igual...
//   por que no ponemos los datos en el JavaScript
//   y que el JavaScript escriba el HTML?
// ==========================================================