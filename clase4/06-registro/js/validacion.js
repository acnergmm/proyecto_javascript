// ==========================================================
// FORMULARIO DE REGISTRO - VALIDACION COMPLETA
//
// Este archivo es el corazon de la clase. Junta los tres ejes:
//   1. Separacion   -> el HTML no tiene ni un onclick ni un style
//   2. JS moderno   -> const, arrow functions, template literals, forEach
//   3. Librerias    -> SweetAlert2 y Font Awesome
//
// La idea central: el usuario se entera del error MIENTRAS escribe,
// no despues de mandar el formulario.
// ==========================================================


// ----------------------------------------------------------
// PASO 1 - Los elementos
// ----------------------------------------------------------
const formulario = document.querySelector("#formulario");

const nombre = document.querySelector("#nombre");
const email = document.querySelector("#email");
const edad = document.querySelector("#edad");
const provincia = document.querySelector("#provincia");
const clave = document.querySelector("#clave");
const clave2 = document.querySelector("#clave2");
const terminos = document.querySelector("#terminos");

const barraClave = document.querySelector("#barra-clave");
const resumen = document.querySelector("#resumen");


// ----------------------------------------------------------
// PASO 2 - Una funcion de validacion por campo
// ----------------------------------------------------------
// Regla que se repite en todas: devuelven "" si el campo esta bien,
// o el texto del error si esta mal. Nada mas. No tocan la pantalla.
// Separar "decidir" de "mostrar" es lo que hace que este codigo
// se pueda leer y arreglar.

const validarNombre = () => {
    const valor = nombre.value.trim();

    if (valor === "") return "El nombre no puede quedar vacío";
    if (valor.length < 3) return "Tiene que tener al menos 3 letras";

    // Una expresion regular: el molde de lo que aceptamos.
    // Letras (con acentos y ñ) y espacios, nada mas.
    const soloLetras = /^[a-záéíóúüñ\s]+$/i;
    if (!soloLetras.test(valor)) return "Solo letras y espacios, sin números";

    return "";
};

const validarEmail = () => {
    const valor = email.value.trim();

    if (valor === "") return "El email no puede quedar vacío";

    // Molde minimo de un email: algo @ algo . algo
    const moldeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!moldeEmail.test(valor)) return "Ese email no parece válido";

    return "";
};

const validarEdad = () => {
    // OJO: .value siempre es texto, aunque el input sea type="number"
    const valor = Number(edad.value);

    if (edad.value.trim() === "") return "Falta la edad";
    if (Number.isNaN(valor)) return "La edad tiene que ser un número";
    if (!Number.isInteger(valor)) return "La edad va sin decimales";
    if (valor < 18) return "Tenés que ser mayor de 18 años";
    if (valor > 120) return "Revisá la edad, parece un error";

    return "";
};

const validarProvincia = () => {
    // En un <select> el .value es el value de la opcion elegida.
    // La primera opcion tiene value="" justamente para poder detectarla.
    if (provincia.value === "") return "Elegí una provincia";

    return "";
};

const validarClave = () => {
    const valor = clave.value;

    if (valor === "") return "La contraseña no puede quedar vacía";
    if (valor.length < 6) return "Mínimo 6 caracteres";
    if (!/[0-9]/.test(valor)) return "Tiene que incluir al menos un número";

    return "";
};

const validarClave2 = () => {
    if (clave2.value === "") return "Repetí la contraseña";

    // La regla que el HTML solo NO puede validar:
    // comparar un campo con otro.
    if (clave2.value !== clave.value) return "Las contraseñas no coinciden";

    return "";
};

const validarTerminos = () => {
    // Un checkbox no se lee con .value sino con .checked
    if (!terminos.checked) return "Tenés que aceptar los términos";

    return "";
};


// ----------------------------------------------------------
// PASO 3 - Una sola funcion que MUESTRA el resultado
// ----------------------------------------------------------
// Recibe el campo y el mensaje de error (o "" si esta bien),
// y se encarga de pintar todo con classList.
// Devuelve true si el campo esta valido, para poder contar despues.

const mostrarResultado = (campo, error) => {

    // El <p> del error se llama "error-" mas el id del campo.
    // Con un template literal armamos el selector.
    const cartel = document.querySelector(`#error-${campo.id}`);

    if (error === "") {
        campo.classList.remove("invalido");
        campo.classList.add("valido");
        cartel.textContent = "";
        return true;
    }

    campo.classList.remove("valido");
    campo.classList.add("invalido");
    cartel.textContent = error;
    return false;
};


// ----------------------------------------------------------
// PASO 4 - La lista de campos con su validador
// ----------------------------------------------------------
// Un array de objetos. Ahora podemos recorrer TODOS los campos
// con un forEach en lugar de repetir el mismo codigo siete veces.

const campos = [
    { elemento: nombre, validar: validarNombre },
    { elemento: email, validar: validarEmail },
    { elemento: edad, validar: validarEdad },
    { elemento: provincia, validar: validarProvincia },
    { elemento: clave, validar: validarClave },
    { elemento: clave2, validar: validarClave2 },
    { elemento: terminos, validar: validarTerminos }
];


// ----------------------------------------------------------
// PASO 5 - Validacion EN VIVO
// ----------------------------------------------------------
// Esto es lo que hace que el usuario no sufra: se entera del error
// al salir del campo, no despues de mandar todo el formulario.

campos.forEach((campo) => {

    // blur = el usuario salio del campo.
    // Es el mejor momento para avisar: ya termino de escribir,
    // y no lo estamos retando letra por letra mientras tipea.
    campo.elemento.addEventListener("blur", () => {
        mostrarResultado(campo.elemento, campo.validar());
    });

    // change = cambio la eleccion. Sirve para el select y el checkbox.
    campo.elemento.addEventListener("change", () => {
        mostrarResultado(campo.elemento, campo.validar());
    });

    // input = esta escribiendo AHORA.
    // Solo lo usamos para BORRAR el error, nunca para crearlo:
    // si arranco a corregir, el cartel rojo se va enseguida.
    campo.elemento.addEventListener("input", () => {
        if (campo.elemento.classList.contains("invalido") && campo.validar() === "") {
            mostrarResultado(campo.elemento, "");
        }
    });
});


// ----------------------------------------------------------
// PASO 6 - Detalle: el medidor de la contraseña
// ----------------------------------------------------------
// El JavaScript no escribe colores: pone una clase y el CSS decide.

clave.addEventListener("input", () => {
    const valor = clave.value;

    barraClave.className = "";   // limpiamos la clase anterior

    if (valor.length === 0) return;

    if (valor.length < 6) {
        barraClave.classList.add("debil");
    } else if (valor.length < 10 || !/[A-Z]/.test(valor)) {
        barraClave.classList.add("media");
    } else {
        barraClave.classList.add("fuerte");
    }
});

// Si cambia la primera contraseña, hay que revisar la repetida de nuevo
clave.addEventListener("input", () => {
    if (clave2.value !== "") {
        mostrarResultado(clave2, validarClave2());
    }
});


// ----------------------------------------------------------
// PASO 7 - El submit
// ----------------------------------------------------------

formulario.addEventListener("submit", (evento) => {

    // Sin esto la pagina se recarga y perdemos todo.
    evento.preventDefault();

    // Validamos TODOS los campos, no solo hasta el primer error:
    // asi el usuario ve de una sola vez todo lo que tiene que corregir.
    // map devuelve un array de true/false.
    const resultados = campos.map((campo) =>
        mostrarResultado(campo.elemento, campo.validar())
    );

    // filter se queda con los false, y length nos dice cuantos son
    const conError = resultados.filter((estaBien) => !estaBien).length;

    // ---------- Si hay errores ----------
    if (conError > 0) {
        Swal.fire({
            icon: "error",
            title: "Faltan datos",
            text: `Revisá ${conError} campo(s) marcado(s) en rojo`,
            confirmButtonColor: "#1976d2"
        });

        // Cortesia importante: mandamos el cursor al primer campo con error
        const primerError = document.querySelector(".invalido");
        if (primerError) primerError.focus();

        return;
    }

    // ---------- Si esta todo bien ----------
    // FormData lee todos los campos de una, usando el atributo name
    const datos = Object.fromEntries(new FormData(formulario));

    Swal.fire({
        icon: "success",
        title: `Bienvenida, ${datos.nombre}!`,
        text: "La cuenta se creó correctamente",
        confirmButtonColor: "#43a047"
    });

    // Mostramos lo que se hubiera enviado al servidor
    resumen.classList.remove("oculto");
    resumen.innerHTML = `
        <b>Esto es lo que viajaría al servidor:</b>
        <dl>
            <dt>Nombre</dt><dd>${datos.nombre}</dd>
            <dt>Email</dt><dd>${datos.email}</dd>
            <dt>Edad</dt><dd>${datos.edad} años</dd>
            <dt>Provincia</dt><dd>${datos.provincia}</dd>
            <dt>Contraseña</dt><dd>${"•".repeat(datos.clave.length)}</dd>
        </dl>
    `;

    // Dejamos el formulario limpio
    formulario.reset();
    barraClave.className = "";
    campos.forEach((campo) => campo.elemento.classList.remove("valido", "invalido"));
});


// ==========================================================
// LA ADVERTENCIA QUE NO PUEDE FALTAR
//
// Todo lo que valida este archivo se puede desactivar desde
// las herramientas del navegador en diez segundos.
//
// La validacion en el navegador es para que el USUARIO no sufra.
// La validacion de verdad, la que protege los datos, va SIEMPRE
// tambien en el servidor. Eso lo vamos a ver en el backend.
// ==========================================================
