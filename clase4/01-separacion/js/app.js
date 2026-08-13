

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
   salida.textContent = "hola este es mi prueba de eventlistener por js";
});

botonTema.addEventListener("click", () => {
    document.body.classList.toggle("tema-oscuro");
});

botonLimpiar.addEventListener("click", () => {
  
   salida.textContent = "";
});


