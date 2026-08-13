// ==========================================================
// PROYECTO INTEGRADOR - LISTA DE TAREAS
//
// Junta los tres temas de la clase:
//   1. Separacion en archivos -> HTML, CSS y JS aparte
//   2. JS moderno             -> const, arrow, template literals, forEach
//   3. Librerias externas     -> SweetAlert2, Font Awesome, Animate.css, Day.js
// ==========================================================


// ---------- PASO 1: los elementos, una sola vez ----------
const campoTarea = document.querySelector("#campo-tarea");
const botonAgregar = document.querySelector("#btn-agregar");
const botonLimpiar = document.querySelector("#btn-limpiar");
const listaTareas = document.querySelector("#lista-tareas");
const contador = document.querySelector("#contador");
const mensajeVacio = document.querySelector("#vacio");
const fecha = document.querySelector("#fecha");


// ---------- PASO 2: la fecha de hoy con Day.js ----------
dayjs.locale("es");
fecha.textContent = dayjs().format("dddd D [de] MMMM [de] YYYY");


// ---------- PASO 3: agregar una tarea ----------
const agregarTarea = () => {
    const texto = campoTarea.value.trim();

    // Validacion con SweetAlert2 en lugar de alert()
    if (texto === "") {
        Swal.fire({
            icon: "warning",
            title: "Falta el texto",
            text: "Escribi la tarea antes de agregarla",
            confirmButtonColor: "#1976d2"
        });
        campoTarea.focus();
        return;
    }

    // --- El <li> contenedor ---
    const item = document.createElement("li");
    item.classList.add("animate__animated", "animate__fadeInDown");

    // --- El icono de check (Font Awesome) ---
    const check = document.createElement("i");
    check.className = "fa-regular fa-circle-check check";

    // --- El texto de la tarea ---
    const etiqueta = document.createElement("span");
    etiqueta.className = "texto";
    etiqueta.textContent = texto;   // textContent, no innerHTML: es texto del usuario

    // --- El boton de borrar ---
    const botonBorrar = document.createElement("button");
    botonBorrar.className = "btn-borrar";
    botonBorrar.innerHTML = `<i class="fa-solid fa-trash"></i>`;

    // --- Eventos propios de ESTA tarea ---

    // Tachar: click en el check o en el texto
    const alternarCompletada = () => {
        item.classList.toggle("completada");
        actualizarEstado();
    };

    check.addEventListener("click", alternarCompletada);
    etiqueta.addEventListener("click", alternarCompletada);

    // Borrar: pide confirmacion con SweetAlert2
    botonBorrar.addEventListener("click", () => {
        Swal.fire({
            icon: "question",
            title: "Borrar esta tarea?",
            text: texto,
            showCancelButton: true,
            confirmButtonText: "Si, borrar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#e53935"
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                // Animamos la salida y borramos cuando termina la animacion
                item.className = "animate__animated animate__fadeOutRight";
                item.addEventListener("animationend", () => {
                    item.remove();
                    actualizarEstado();
                });
            }
        });
    });

    // --- Armamos el arbol y lo colgamos ---
    item.append(check, etiqueta, botonBorrar);
    listaTareas.append(item);

    // --- Dejamos todo listo para la proxima ---
    campoTarea.value = "";
    campoTarea.focus();
    actualizarEstado();
};


// ---------- PASO 4: contador y mensaje de lista vacia ----------
const actualizarEstado = () => {
    const todas = document.querySelectorAll("#lista-tareas li");
    const pendientes = document.querySelectorAll("#lista-tareas li:not(.completada)");

    contador.textContent = pendientes.length === 1
        ? "1 pendiente"
        : `${pendientes.length} pendientes`;

    // classList decide si se ve el mensaje de "no hay tareas"
    mensajeVacio.classList.toggle("oculto", todas.length > 0);
};


// ---------- PASO 5: borrar todas las completadas ----------
const borrarCompletadas = () => {
    const completadas = document.querySelectorAll("#lista-tareas li.completada");

    if (completadas.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Nada para borrar",
            text: "Todavia no marcaste ninguna tarea como completada",
            confirmButtonColor: "#1976d2"
        });
        return;
    }

    Swal.fire({
        icon: "warning",
        title: `Borrar ${completadas.length} tarea(s)?`,
        showCancelButton: true,
        confirmButtonText: "Si, borrar todas",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e53935"
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            // forEach en lugar del for de siempre
            completadas.forEach((tarea) => tarea.remove());
            actualizarEstado();

            Swal.fire({
                icon: "success",
                title: "Listo",
                timer: 1200,
                showConfirmButton: false
            });
        }
    });
};


// ---------- PASO 6: conectar los eventos generales ----------
botonAgregar.addEventListener("click", agregarTarea);
botonLimpiar.addEventListener("click", borrarCompletadas);

campoTarea.addEventListener("keyup", (evento) => {
    if (evento.key === "Enter") agregarTarea();
});

// Arrancamos mostrando el estado inicial
actualizarEstado();
