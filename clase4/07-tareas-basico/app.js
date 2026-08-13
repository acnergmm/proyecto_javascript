// ==========================================================
// LISTA DE TAREAS - VERSION BASICA
//
// Todo el comportamiento de la pagina vive en este archivo.
// El index.html no tiene ni una linea de JavaScript.
//
// Usa solamente lo que vimos hoy:
//   const y let, arrow functions, template literals,
//   querySelector, createElement, classList y forEach.
//
// Nada de librerias externas: funciona sin internet.
// ==========================================================


// ----------------------------------------------------------
// PASO 1 - Buscar los elementos UNA sola vez
// ----------------------------------------------------------
// Van con const porque siempre van a apuntar al mismo elemento.
// Los guardamos arriba para no repetir querySelector en cada funcion.

const campoTarea = document.querySelector("#campo-tarea");
const botonAgregar = document.querySelector("#btn-agregar");
const botonLimpiar = document.querySelector("#btn-limpiar");
const listaTareas = document.querySelector("#lista-tareas");
const contador = document.querySelector("#contador");
const aviso = document.querySelector("#aviso");


// ----------------------------------------------------------
// PASO 2 - Agregar una tarea
// ----------------------------------------------------------
// Es una arrow function guardada en una const.
// Antes lo escribiamos como: function agregarTarea() { ... }

const agregarTarea = () => {

    // .trim() saca los espacios de los costados,
    // asi no se puede agregar una tarea que sea solo espacios
    const texto = campoTarea.value.trim();

    // --- Validacion ---
    if (texto === "") {
        aviso.classList.remove("oculto");   // mostramos el cartel
        campoTarea.focus();
        return;                             // return corta la funcion aca
    }

    // Si llegamos hasta aca esta todo bien, escondemos el cartel
    aviso.classList.add("oculto");


    // --- Crear el <li> ---
    // Tres pasos siempre: crear, llenar, colgar.
    const item = document.createElement("li");

    // --- El texto de la tarea, dentro de un <span> ---
    const etiqueta = document.createElement("span");
    etiqueta.className = "texto";
    etiqueta.textContent = texto;   // textContent y no innerHTML: es texto del usuario

    // --- El boton para borrar esta tarea ---
    const botonBorrar = document.createElement("button");
    botonBorrar.className = "btn-borrar";
    botonBorrar.textContent = "Borrar";


    // --- Los eventos de ESTA tarea en particular ---

    // Click en el texto: tachar / destachar.
    // toggle reemplaza todo el if/else con una variable de estado.
    etiqueta.addEventListener("click", () => {
        item.classList.toggle("completada");
        actualizarContador();
    });

    // Click en Borrar: se elimina el <li> completo
    botonBorrar.addEventListener("click", () => {
        item.remove();
        actualizarContador();
    });


    // --- Colgar todo en la pagina ---
    // Sin este paso los elementos existen en memoria pero no se ven.
    item.append(etiqueta, botonBorrar);   // el span y el boton van dentro del li
    listaTareas.append(item);             // y el li va dentro del ul


    // --- Dejar el input listo para la proxima tarea ---
    campoTarea.value = "";
    campoTarea.focus();

    actualizarContador();
};


// ----------------------------------------------------------
// PASO 3 - Contar las tareas que faltan
// ----------------------------------------------------------

const actualizarContador = () => {

    // :not(.completada) trae solo los li que NO estan tachados
    const pendientes = document.querySelectorAll("#lista-tareas li:not(.completada)");

    // Template literal: la variable va dentro de ${} y todo entre backticks
    if (pendientes.length === 1) {
        contador.textContent = "1 pendiente";
    } else {
        contador.textContent = `${pendientes.length} pendientes`;
    }
};


// ----------------------------------------------------------
// PASO 4 - Borrar todas las completadas
// ----------------------------------------------------------

const borrarCompletadas = () => {

    const completadas = document.querySelectorAll("#lista-tareas li.completada");

    // forEach recorre la lista y ejecuta la funcion una vez por elemento.
    // Reemplaza al for (let i = 0; i < completadas.length; i++)
    completadas.forEach((tarea) => tarea.remove());

    actualizarContador();
};


// ----------------------------------------------------------
// PASO 5 - Conectar los eventos generales
// ----------------------------------------------------------
// Sin parentesis: le pasamos LA FUNCION, no el resultado de ejecutarla.
//   addEventListener("click", agregarTarea)     BIEN
//   addEventListener("click", agregarTarea())   MAL

botonAgregar.addEventListener("click", agregarTarea);
botonLimpiar.addEventListener("click", borrarCompletadas);

// Bonus: agregar tambien apretando Enter en el input
campoTarea.addEventListener("keyup", (evento) => {
    if (evento.key === "Enter") {
        agregarTarea();
    }
});

// Mientras escribe, escondemos el cartel de error
campoTarea.addEventListener("keyup", () => {
    if (campoTarea.value !== "") {
        aviso.classList.add("oculto");
    }
});


// ----------------------------------------------------------
// PASO 6 - Estado inicial
// ----------------------------------------------------------
// Que el contador arranque bien desde el primer momento
actualizarContador();
