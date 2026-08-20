// ============================================================
// Clase 5 - Chat con Ollama
// JavaScript puro: fetch + async/await + streaming (NDJSON)
//
// Ollama corre en tu propia maquina y expone una API HTTP.
//   ollama serve            -> levanta el servidor en el puerto 11434
//   ollama pull llama3.2    -> descarga un modelo
//   ollama list             -> muestra los modelos que ya tenes
// ============================================================

// ---------- 1. Configuracion ----------

const SERVIDOR_POR_DEFECTO = "http://localhost:11434";
const CLAVE_STORAGE = "clase5-ollama-url";

// Instruccion de sistema: define como se comporta el asistente
const SISTEMA = "Sos un asistente que ayuda a estudiantes de un curso de JavaScript. " +
    "Responde en espanol, claro y directo, con ejemplos de codigo cortos cuando ayuden.";

// Parametros del modelo. temperature bajo = respuestas mas predecibles.
const OPCIONES = { temperature: 0.7 };

// ---------- 2. Estado ----------

// El historial completo de la conversacion. Se manda entero en cada pedido,
// porque la API no recuerda nada entre llamadas.
let historial = [];
let enviando = false;
let conectado = false;

// ---------- 3. Referencias al DOM ----------

const $formulario = document.getElementById("formulario");
const $entrada = document.getElementById("entrada");
const $lista = document.getElementById("lista");
const $mensajes = document.getElementById("mensajes");
const $bienvenida = document.getElementById("bienvenida");
const $estado = document.getElementById("estado");
const $btnEnviar = document.getElementById("btn-enviar");
const $btnNuevo = document.getElementById("btn-nuevo");
const $modelo = document.getElementById("modelo");
const $panelConfig = document.getElementById("panel-config");
const $btnConfig = document.getElementById("btn-config");
const $servidor = document.getElementById("servidor");
const $btnGuardar = document.getElementById("btn-guardar");
const $btnReset = document.getElementById("btn-reset");

// La direccion del servidor sale de localStorage, con el default como respaldo
const urlServidor = () => localStorage.getItem(CLAVE_STORAGE) || SERVIDOR_POR_DEFECTO;

// ---------- 4. Eventos ----------

// Enviar con el boton o con Enter (el submit del form cubre los dos casos)
$formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    enviar($entrada.value);
});

// Enter envia, Shift+Enter hace salto de linea
$entrada.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
        evento.preventDefault();
        $formulario.requestSubmit();
    }
});

// El textarea crece con el texto hasta el maximo que puso Tailwind (max-h-64)
$entrada.addEventListener("input", ajustarAltura);

// Botones de sugerencia de la pantalla de bienvenida
document.querySelectorAll("[data-sugerencia]").forEach(($boton) => {
    $boton.addEventListener("click", () => enviar($boton.dataset.sugerencia));
});

// Panel del servidor
$btnConfig.addEventListener("click", () => $panelConfig.classList.toggle("hidden"));

$btnGuardar.addEventListener("click", () => {
    const url = $servidor.value.trim().replace(/\/$/, "");   // sin la barra final
    if (url) localStorage.setItem(CLAVE_STORAGE, url);
    $panelConfig.classList.add("hidden");
    cargarModelos();
});

$btnReset.addEventListener("click", () => {
    localStorage.removeItem(CLAVE_STORAGE);
    $servidor.value = SERVIDOR_POR_DEFECTO;
    cargarModelos();
});

// Empezar de cero
$btnNuevo.addEventListener("click", () => {
    historial = [];
    $lista.querySelectorAll("[data-mensaje]").forEach(($m) => $m.remove());
    $bienvenida.classList.remove("hidden");
    $entrada.value = "";
    ajustarAltura();
    $entrada.focus();
});

// ---------- 5. Que modelos hay instalados: GET /api/tags ----------

async function cargarModelos() {
    $modelo.innerHTML = '<option value="">Buscando modelos...</option>';
    conectado = false;
    actualizarEstado("Conectando con Ollama...");

    try {
        const respuesta = await fetch(urlServidor() + "/api/tags");
        if (!respuesta.ok) throw new Error("el servidor respondio " + respuesta.status);

        const datos = await respuesta.json();
        const modelos = datos.models || [];

        if (modelos.length === 0) {
            $modelo.innerHTML = '<option value="">Sin modelos</option>';
            actualizarEstado("Ollama esta corriendo pero no tiene modelos: ollama pull llama3.2");
            return;
        }

        // Una opcion por modelo instalado
        $modelo.innerHTML = "";
        modelos.forEach((modelo) => {
            const $opcion = document.createElement("option");
            $opcion.value = modelo.name;
            $opcion.textContent = modelo.name;
            $modelo.appendChild($opcion);
        });

        conectado = true;
        actualizarEstado(modelos.length + " modelo(s) disponible(s)");
    } catch (error) {
        $modelo.innerHTML = '<option value="">Sin conexion</option>';
        actualizarEstado("No hay conexion con " + urlServidor());
        mostrarAyudaConexion();
    }
}

function mostrarAyudaConexion() {
    const $aviso = document.getElementById("aviso-config");
    $aviso.className = "text-xs leading-relaxed text-amber-400/90";
    $aviso.innerHTML =
        "No pude hablar con Ollama. Revisa tres cosas: que este corriendo " +
        '(<code class="rounded bg-white/10 px-1 py-0.5">ollama serve</code>), que tengas algun modelo ' +
        '(<code class="rounded bg-white/10 px-1 py-0.5">ollama pull llama3.2</code>), y que esta pagina ' +
        "se abra desde un servidor local (http://localhost:...) y no con doble clic, porque desde " +
        "<code>file://</code> el navegador bloquea el pedido por CORS.";
    $panelConfig.classList.remove("hidden");
}

// ---------- 6. Flujo principal ----------

async function enviar(textoCrudo) {
    const texto = textoCrudo.trim();
    if (!texto || enviando) return;

    if (!$modelo.value) {
        mostrarAyudaConexion();
        return;
    }

    // 6.1 Pintar el mensaje del usuario y limpiar la caja
    $bienvenida.classList.add("hidden");
    pintarUsuario(texto);
    historial.push({ role: "user", content: texto });
    $entrada.value = "";
    ajustarAltura();
    bloquear(true);

    // 6.2 Crear la burbuja vacia del asistente: ahi vamos escribiendo la respuesta
    const $respuesta = pintarAsistente();
    $respuesta.innerHTML = '<span class="animate-pulse text-neutral-400">Pensando...</span>';

    let completo = "";

    try {
        // Cada trozo que llega se suma al texto y se vuelve a pintar
        const alRecibir = (trozo) => {
            completo += trozo;
            $respuesta.innerHTML = formatear(completo);
            bajarScroll();
        };

        const velocidad = await pedirAOllama(alRecibir);

        historial.push({ role: "assistant", content: completo });
        actualizarEstado(velocidad || "Listo");
    } catch (error) {
        $respuesta.innerHTML =
            '<span class="text-red-400">Error: ' + escapar(error.message) + "</span>";
        actualizarEstado("El pedido fallo");
        // Si fallo, saco el ultimo mensaje del usuario para que pueda reintentar limpio
        historial.pop();
    } finally {
        bloquear(false);
        bajarScroll();
        $entrada.focus();
    }
}

// ---------- 7. La llamada a la API: POST /api/chat ----------

async function pedirAOllama(alRecibir) {
    let respuesta;

    try {
        respuesta = await fetch(urlServidor() + "/api/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                model: $modelo.value,
                stream: true,                                   // la respuesta llega de a pedacitos
                options: OPCIONES,
                messages: [{ role: "system", content: SISTEMA }, ...historial]
            })
        });
    } catch (error) {
        // fetch solo tira excepcion si no llego a conectarse
        mostrarAyudaConexion();
        throw new Error("no pude conectarme a " + urlServidor() + " (esta corriendo ollama serve?)");
    }

    if (!respuesta.ok) {
        throw new Error(await leerError(respuesta));
    }

    // 7.1 Leer el stream. Ollama manda NDJSON: un objeto JSON por linea.
    //     {"message":{"content":"Hola"},"done":false}
    //     {"done":true,"eval_count":120,"eval_duration":1500000000}
    const lector = respuesta.body.getReader();
    const decodificador = new TextDecoder();
    let pendiente = "";
    let estadisticas = null;

    while (true) {
        const { value, done } = await lector.read();
        if (done) break;

        pendiente += decodificador.decode(value, { stream: true });
        const lineas = pendiente.split("\n");
        pendiente = lineas.pop();           // la ultima puede estar cortada a la mitad

        for (const linea of lineas) {
            if (!linea.trim()) continue;

            const evento = JSON.parse(linea);

            if (evento.error) throw new Error(evento.error);
            if (evento.message && evento.message.content) alRecibir(evento.message.content);
            if (evento.done) estadisticas = evento;
        }
    }

    return medirVelocidad(estadisticas);
}

// Ollama avisa el problema en un JSON con la propiedad error
async function leerError(respuesta) {
    const crudo = await respuesta.text();
    try {
        return JSON.parse(crudo).error;
    } catch {
        return "el pedido fallo con codigo " + respuesta.status;
    }
}

// Las duraciones vienen en nanosegundos
function medirVelocidad(estadisticas) {
    if (!estadisticas || !estadisticas.eval_count || !estadisticas.eval_duration) return "";
    const segundos = estadisticas.eval_duration / 1e9;
    return estadisticas.eval_count + " tokens en " + segundos.toFixed(1) + "s (" +
        (estadisticas.eval_count / segundos).toFixed(1) + " tokens/s)";
}

// ---------- 8. Pintar en pantalla ----------

function pintarUsuario(texto) {
    const $fila = document.createElement("div");
    $fila.dataset.mensaje = "usuario";
    $fila.className = "flex justify-end";
    $fila.innerHTML =
        '<div class="max-w-[80%] whitespace-pre-wrap rounded-3xl bg-[#2f2f2f] px-5 py-3 text-[15px] leading-relaxed">' +
        escapar(texto) +
        "</div>";
    $lista.appendChild($fila);
    bajarScroll();
}

function pintarAsistente() {
    const $fila = document.createElement("div");
    $fila.dataset.mensaje = "asistente";
    $fila.className = "flex gap-4";
    $fila.innerHTML =
        '<span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold">IA</span>' +
        '<div class="min-w-0 flex-1 space-y-3 text-[15px] leading-relaxed"></div>';
    $lista.appendChild($fila);
    bajarScroll();
    return $fila.querySelector("div");
}

function bajarScroll() {
    $mensajes.scrollTop = $mensajes.scrollHeight;
}

function bloquear(valor) {
    enviando = valor;
    $btnEnviar.disabled = valor;
    $entrada.disabled = valor;
    if (valor) actualizarEstado("Escribiendo...");
}

function actualizarEstado(texto) {
    $estado.textContent = texto;
    $estado.className = conectado || enviando
        ? "text-xs text-neutral-500"
        : "text-xs text-amber-400/90";
}

function ajustarAltura() {
    $entrada.style.height = "auto";
    $entrada.style.height = $entrada.scrollHeight + "px";
}

// ---------- 9. Formato del texto (markdown minimo) ----------

// Siempre escapamos primero: el texto que viene de afuera nunca se inserta como HTML crudo.
function escapar(texto) {
    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function formatear(texto) {
    let html = escapar(texto);

    // Bloques de codigo ```...```
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g,
        '<pre class="scroll-fino overflow-x-auto rounded-xl bg-[#171717] p-4 text-sm"><code>$2</code></pre>');

    // Codigo en linea `...`
    html = html.replace(/`([^`\n]+)`/g,
        '<code class="rounded bg-white/10 px-1.5 py-0.5 text-[13px]">$1</code>');

    // Negrita **...**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Saltos de linea, salvo los que ya quedaron dentro de un <pre>
    return html
        .split(/(<pre[\s\S]*?<\/pre>)/)
        .map((parte) => (parte.startsWith("<pre") ? parte : parte.replaceAll("\n", "<br>")))
        .join("");
}

// ---------- 10. Arranque ----------

$servidor.value = urlServidor();
ajustarAltura();
$entrada.focus();
cargarModelos();
