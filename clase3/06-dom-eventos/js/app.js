// ============================================================
// Clase 3 - Integrador: la calculadora de presupuesto
//
// Se construye en cinco pasos, y cada paso se prueba en el
// navegador antes de escribir el siguiente.
// ============================================================


// ------------------------------------------------------------
// PASO 1 - Buscar los elementos del HTML
//
// El navegador convierte el HTML en objetos que el JavaScript
// puede tocar: eso es el DOM. getElementById busca por el id.
// ------------------------------------------------------------

const campoMonto = document.getElementById("monto");
const campoCuotas = document.getElementById("cuotas");
const btnCalcular = document.getElementById("btn-calcular");
const btnLimpiar = document.getElementById("btn-limpiar");
const aviso = document.getElementById("aviso");
const resultado = document.getElementById("resultado");

// Si algo aparece null aca, el id esta mal escrito. Probalo:
console.log("Paso 1 - el boton es:", btnCalcular);


// ------------------------------------------------------------
// PASO 4 - Las funciones del calculo
//
// Son las mismas del archivo 04-funciones.html. Cada una hace
// una cosa sola y devuelve un valor con return.
// ------------------------------------------------------------

function calcularDescuento(monto) {
    if (monto >= 2000000) return 10;    // del tramo mas alto al mas bajo
    if (monto >= 500000) return 5;
    return 0;
}

function calcularIva(monto) {
    return monto * 0.10;                // 10% en Paraguay
}

// Devuelve el detalle de las cuotas como texto, usando un for
function armarPlanDeCuotas(total, cuotas) {
    const valorCuota = total / cuotas;
    let texto = "";

    for (let i = 1; i <= cuotas; i++) {
        texto = texto + "  Cuota " + i + " de " + cuotas + ": " +
            formatear(valorCuota) + "\n";
    }

    return texto;
}

// Los guaranies se leen mejor con puntos de miles
function formatear(numero) {
    return Math.round(numero).toLocaleString("es-PY");
}


// ------------------------------------------------------------
// PASO 3 y 5 - Leer los campos, validar y calcular
// ------------------------------------------------------------

function calcular() {
    // PASO 3: todo lo que sale de un input es TEXTO -> Number()
    const monto = Number(campoMonto.value);
    const cuotas = Number(campoCuotas.value);

    // PASO 5: validar antes de calcular
    if (campoMonto.value === "") {
        mostrarAviso("Falta cargar el monto", "error");
        resultado.textContent = "";
        return;                          // corta la funcion: no calcula nada
    }

    if (monto <= 0) {
        mostrarAviso("El monto tiene que ser mayor a cero", "error");
        resultado.textContent = "";
        return;
    }

    if (cuotas < 1) {
        mostrarAviso("Las cuotas tienen que ser al menos 1", "error");
        resultado.textContent = "";
        return;
    }

    // Si llegamos aca, los datos estan bien
    const descuento = calcularDescuento(monto);
    const ahorro = monto * descuento / 100;
    const conDescuento = monto - ahorro;
    const iva = calcularIva(conDescuento);
    const total = conDescuento + iva;

    // Armamos el texto de la respuesta linea por linea.
    // padEnd(16) completa la etiqueta con espacios hasta los 16 caracteres,
    // asi los montos quedan uno debajo del otro aunque el texto cambie.
    let texto = "";
    texto = texto + "Monto:".padEnd(16) + formatear(monto) + "\n";

    if (descuento > 0) {
        texto = texto + ("Descuento " + descuento + "%:").padEnd(16) + "- " + formatear(ahorro) + "\n";
        texto = texto + "Subtotal:".padEnd(16) + formatear(conDescuento) + "\n";
    } else {
        texto = texto + "Descuento:".padEnd(16) + "no llega al primer tramo (500.000)\n";
    }

    texto = texto + "IVA 10%:".padEnd(16) + "+ " + formatear(iva) + "\n";
    texto = texto + "TOTAL:".padEnd(16) + formatear(total) + "\n\n";
    texto = texto + "Plan de " + cuotas + " cuotas:\n";
    texto = texto + armarPlanDeCuotas(total, cuotas);

    resultado.textContent = texto;
    mostrarAviso("Presupuesto calculado", "ok");
}

// Escribe el aviso y le pone la clase que le da el color
function mostrarAviso(texto, tipo) {
    aviso.textContent = texto;
    aviso.className = tipo;             // "error" o "ok", definidas en el CSS
}

function limpiar() {
    campoMonto.value = "";
    campoCuotas.value = "6";
    resultado.textContent = "Cargá un monto y apretá Calcular.";
    mostrarAviso("", "");
    campoMonto.focus();
}


// ------------------------------------------------------------
// PASO 2 - Escuchar los eventos
//
// addEventListener conecta un elemento, un evento y la funcion
// que se ejecuta cuando ese evento pasa.
// Ojo: va calcular SIN parentesis, porque no la queremos
// ejecutar ahora, queremos que el navegador la ejecute despues.
// ------------------------------------------------------------

btnCalcular.addEventListener("click", calcular);
btnLimpiar.addEventListener("click", limpiar);

// Extra: calcular tambien al apretar Enter dentro de un campo
campoMonto.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") calcular();
});

campoCuotas.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") calcular();
});
