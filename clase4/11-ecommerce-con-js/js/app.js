
// ==========================================================
// PARTE 1 - LOS DATOS
// ==========================================================
// Antes cada producto eran 7 lineas de HTML.
// Ahora es UNA linea de datos. Agregar un producto nuevo
// es escribir un renglon mas en este array.

const productos = [
    {
         id: 1,
         nombre: 'Notebook Pro 14"', 
         precio: 7300000,
        categoria: "computacion", 
          emoji: "💻",
           stock: true
    },
    {
         id: 2,
         nombre: "Mouse inalámbrico",
         precio: 75000,
         categoria: "accesorios",
         emoji: "🖱️",
         stock: true
    },
    {
         id: 3,
         nombre: "Teclado mecánico",
         precio: 290000,
         categoria: "accesorios",
         emoji: "⌨️",
         stock: false
    },
    {
         id: 4,
         nombre: 'Monitor 27" 4K',
         precio: 2200000,
         categoria: "computacion",
         emoji: "🖥️",
         stock: true
    },
    {
         id: 5,
         nombre: "Auriculares Bluetooth",
         precio: 550000,
         categoria: "audio",
         emoji: "🎧",
         stock: true
    },
    {
         id: 6,
         nombre: "Parlante portátil",
         precio: 730000,
         categoria: "audio",
         emoji: "🔊",
         stock: true
    },
    {
         id: 7,
         nombre: "Webcam Full HD",
         precio: 440000,
         categoria: "accesorios",
         emoji: "📷",
         stock: false
    },
    {
         id: 8,
         nombre: 'Tablet 11"',
         precio: 2900000,
         categoria: "computacion",
         emoji: "📱",
         stock: true
    },
    {
         id: 9,
         nombre: 'guampa de acero',
         precio: 30000,
         categoria: "accesorios",
         emoji: "🥛",
         stock: true
    },
     {
         id: 10,
         nombre: 'escoba',
         precio: 20000,
         categoria: "accesorios",
         emoji: "🧹",
         stock: true
    }
];











































// Reglas del negocio, escritas UNA vez y en UN solo lugar.
// En la version sin JavaScript el envio estaba escrito a mano
// en el HTML: para cambiarlo habia que editar el HTML.
const COSTO_ENVIO = 35000;
const ENVIO_GRATIS_DESDE = 1000000;


// ==========================================================
// PARTE 2 - EL ESTADO
// ==========================================================
// Estas tres variables son la memoria de la pagina.
// Van con let porque cambian todo el tiempo.

let carrito = [];              // los productos que eligio el usuario
let categoriaActiva = "todos"; // el filtro elegido
let busqueda = "";             // lo que escribio en el buscador







// ==========================================================
// PARTE 3 - LOS ELEMENTOS
// ==========================================================
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


// ==========================================================
// PARTE 4 - UNA AYUDITA PARA LOS PRECIOS
// ==========================================================
// toLocaleString pone los puntos de miles como se escriben
// en Paraguay, y el simbolo del guarani adelante. En la version sin JS los puntos los
// escribiamos a mano y a veces quedaban mal.

const conPuntos = (numero) => `₲${numero.toLocaleString("es-PY")}`;


// ==========================================================
// PARTE 5 - DIBUJAR LA GRILLA
// ==========================================================

const dibujarProductos = () => {

    // --- Primero filtramos, sin tocar el array original ---
    const visibles = productos
        .filter((p) => categoriaActiva === "todos" || p.categoria === categoriaActiva)
        .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    // --- Despues los convertimos en HTML con map + join ---
    // El data-id es la clave: guarda en el HTML a que producto
    // corresponde cada boton, para poder encontrarlo despues.
    grilla.innerHTML = visibles.map((p) => `
        <article class="producto ${p.stock ? "" : "sin-stock"}">
            <div class="imagen">${p.emoji}</div>
            <span class="categoria">${p.categoria}</span>
            <h3>${p.nombre}</h3>
            ${p.stock ? "" : '<span class="agotado">Sin stock</span>'}
            <span class="precio">${conPuntos(p.precio)}</span>
            <button class="boton" data-id="${p.id}" ${p.stock ? "" : "disabled"}>
                ${p.stock ? "Agregar al carrito" : "No disponible"}
            </button>
        </article>
    `).join("");

    // --- El subtitulo se cuenta solo ---
    subtitulo.textContent = visibles.length === productos.length
        ? `${productos.length} productos disponibles`
        : `Mostrando ${visibles.length} de ${productos.length} productos`;

    // --- Mensaje de "no encontramos nada" ---
    sinResultados.classList.toggle("oculto", visibles.length > 0);
};


// ==========================================================
// PARTE 6 - DIBUJAR EL CARRITO Y CALCULAR LOS TOTALES
// ==========================================================
// Esta funcion es la respuesta a la pregunta del bloque:
// "y si el cliente cambia una cantidad?"
// Se llama de nuevo y los tres numeros se recalculan solos.

const dibujarCarrito = () => {

    // --- Las filas del carrito ---
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

    // --- LOS TOTALES, CALCULADOS ---
    // reduce recorre el carrito y va acumulando la suma.
    // Es el for de siempre, pero en una linea.
    const subtotal = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

    // Una regla de negocio real: envio gratis a partir de cierto monto.
    // Sin JavaScript esto es imposible de mostrar bien.
    const envio = subtotal >= ENVIO_GRATIS_DESDE || subtotal === 0 ? 0 : COSTO_ENVIO;

    document.querySelector("#subtotal").textContent = conPuntos(subtotal);
    document.querySelector("#envio").textContent = envio === 0 ? "¡Gratis!" : conPuntos(envio);
    document.querySelector("#total").textContent = conPuntos(subtotal + envio);

    // --- El globito del encabezado cuenta las unidades ---
    const unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    globo.textContent = unidades;

    // --- Mostrar u ocultar segun si hay algo en el carrito ---
    const vacio = carrito.length === 0;
    carritoVacio.classList.toggle("oculto", !vacio);
    totales.classList.toggle("oculto", vacio);
    botonComprar.disabled = vacio;
};


// ==========================================================
// PARTE 7 - AGREGAR, SUMAR, RESTAR Y QUITAR
// ==========================================================

const agregarAlCarrito = (id) => {

    // find busca el primero que cumpla la condicion
    const producto = productos.find((p) => p.id === id);

    // Ya esta en el carrito? Entonces sumamos cantidad
    const enCarrito = carrito.find((item) => item.id === id);

    if (enCarrito) {
        enCarrito.cantidad++;
    } else {
        // El spread ... copia todos los datos del producto
        // y le agregamos la cantidad
        carrito.push({ ...producto, cantidad: 1 });
    }

    dibujarCarrito();

    // Avisito discreto arriba a la derecha (SweetAlert2)
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${producto.nombre} agregado`,
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: true
    });
};

const cambiarCantidad = (id, cuanto) => {
    const item = carrito.find((item) => item.id === id);
    if (!item) return;

    item.cantidad += cuanto;

    // Si llego a cero, se va del carrito
    if (item.cantidad < 1) {
        quitarDelCarrito(id);
        return;
    }

    dibujarCarrito();
};

const quitarDelCarrito = (id) => {
    // filter arma un carrito nuevo sin ese producto
    carrito = carrito.filter((item) => item.id !== id);
    dibujarCarrito();
};


// ==========================================================
// PARTE 8 - LOS EVENTOS
// ==========================================================
// Detalle importante: las tarjetas las dibujamos con innerHTML,
// asi que no podemos ponerle un addEventListener a cada boton
// (se borran y se vuelven a crear todo el tiempo).
//
// La solucion se llama DELEGACION: un solo listener en el
// contenedor, que pregunta en QUE se hizo click.
//   evento.target        -> el elemento exacto que se clickeo
//   .closest("button")   -> subimos hasta el boton mas cercano
//   .dataset.id          -> lee el data-id que pusimos en el HTML

grilla.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;   // clickeo en la tarjeta pero no en el boton

    agregarAlCarrito(Number(boton.dataset.id));
});

carritoItems.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;

    const id = Number(boton.dataset.id);

    if (boton.dataset.accion === "sumar") cambiarCantidad(id, 1);
    if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
    if (boton.dataset.accion === "quitar") quitarDelCarrito(id);
});

// --- Los filtros por categoria ---
filtros.addEventListener("click", (evento) => {
    const chip = evento.target.closest(".chip");
    if (!chip) return;

    // Sacamos la clase activo de todos y se la ponemos al elegido
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("activo"));
    chip.classList.add("activo");

    categoriaActiva = chip.dataset.categoria;
    dibujarProductos();
});

// --- El buscador, filtrando MIENTRAS escribe ---
// Esto es lo que en la version sin JavaScript era un adorno.
buscador.addEventListener("input", () => {
    busqueda = buscador.value.trim();
    dibujarProductos();
});

// --- Finalizar compra ---
botonComprar.addEventListener("click", () => {
    const subtotal = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;

    Swal.fire({
        icon: "success",
        title: "¡Gracias por tu compra!",
        html: `
            Vas a pagar <b>${conPuntos(subtotal + envio)}</b><br>
            <small>${carrito.length} producto(s) en camino</small>
        `,
        confirmButtonColor: "#4fc3a1"
    }).then(() => {
        carrito = [];
        dibujarCarrito();
    });
});

// El boton del carrito del encabezado: lleva el scroll al carrito
document.querySelector("#btn-carrito").addEventListener("click", () => {
    document.querySelector(".carrito").scrollIntoView({ behavior: "smooth" });
});


// ==========================================================
// PARTE 9 - ARRANCAR
// ==========================================================
// Cuando la pagina carga, el HTML esta vacio.
// Estas dos lineas lo llenan todo.

dibujarProductos();
dibujarCarrito();


// ==========================================================
// EL RESUMEN DE LA CLASE, EN NUMEROS
//
//   Version sin JavaScript      Version con JavaScript
//   ---------------------------------------------------
//   HTML: 140 lineas            HTML: 70 lineas
//   Con 200 productos:          Con 200 productos:
//     ~1400 lineas                sigue en 70
//   Agregar un producto:        Agregar un producto:
//     7 lineas de HTML            1 linea en el array
//     + editar el titulo
//     + recalcular 3 totales
//   Filtrar por categoria:      Filtrar por categoria:
//     4 archivos HTML            ya funciona
//   Buscar: imposible           Buscar: ya funciona
//   Totales: a mano, y quedan   Totales: siempre correctos
//            mal al primer
//            cambio
//
// El diseño era el mismo. Lo que faltaba era el JavaScript.
// ==========================================================
