// ============================================
// TODO el comportamiento vive aca.
// El HTML no sabe que este archivo existe,
// mas alla de la linea <script src="js/app.js" defer>
// ============================================

// ---------- 1. Buscamos los elementos ----------
// const = esta variable nunca va a apuntar a otra cosa.
// Es lo que corresponde para los elementos del DOM.
const botonSaludar = document.querySelector("#btn-saludar");
const botonTema = document.querySelector("#btn-tema");
const botonLimpiar = document.querySelector("#btn-limpiar");
const salida = document.querySelector("#salida");


// ---------- 2. Conectamos los eventos ----------
// addEventListener reemplaza al onclick del HTML.
// Asi el HTML queda limpio y el comportamiento vive aca.
botonSaludar.addEventListener("click", () => {
    salida.textContent = "Hola! El HTML no tiene ni un onclick.";
});

botonTema.addEventListener("click", () => {
    document.body.classList.toggle("tema-oscuro");
});

botonLimpiar.addEventListener("click", () => {
    salida.textContent = "";
});


// ============================================
// LOS DOS ERRORES CLASICOS DE ESTE BLOQUE
// ============================================
//
// 1) Poner el <script> en el <head> SIN defer.
//    El JS corre antes de que exista el HTML y
//    querySelector devuelve null:
//      "Cannot read properties of null"
//    Solucion: defer, o el script al final del <body>.
//
// 2) Rutas mal escritas.
//    href="estilos.css"       -> busca en la carpeta actual
//    href="css/estilos.css"   -> entra a la carpeta css
//    href="../estilos.css"    -> sube una carpeta
//    Si el CSS no aparece, mirar la pestaña Network (F12).
// ============================================
