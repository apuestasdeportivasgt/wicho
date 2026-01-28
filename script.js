// script.js - Pronósticos IA Fútbol

// ←←← CAMBIA ESTA URL por la tuya real (la que termina en /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";  // ¡Pega aquí tu URL!

async function cargarDatos() {
  const loading = document.getElementById("loading");
  const container = document.getElementById("partidos-container");

  try {
    console.log("Iniciando fetch →", API_URL);
    loading.innerHTML = "Conectando a la API... (puede tardar 10–40 segundos)";

    const response = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow',
      mode: 'cors',
      cache: 'no-store'
    });

    console.log("Respuesta recibida. Status:", response.status);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Datos parseados OK. Ligas disponibles:", Object.keys(data.calendario || {}));

    // Limpiamos loading y mostramos sección
    loading.classList.add("hidden");
    document.getElementById("calendario").classList.remove("hidden");

    // Por ahora mostramos SOLO UEFA Champions League para que cargue rápido
    const ligaSeleccionada = "UEFA_Champions_League";
    const partidos = data.calendario?.[ligaSeleccionada] || [];

    if (partidos.length === 0) {
      container.innerHTML = `<p>No hay partidos próximos en ${ligaSeleccionada.replace(/_/g, ' ')} o la hoja está vacía.</p>`;
      return;
    }

    container.innerHTML = ""; // limpiamos

    // Título de la liga
    const tituloLiga = document.createElement("h3");
    tituloLiga.textContent = ligaSeleccionada.replace(/_/g, " ");
    container.appendChild(tituloLiga);

    partidos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      // Formateamos fecha y hora en zona Guatemala
      const fechaHora = new Date(p.fecha);
      const fechaFormateada = fechaHora.toLocaleString('es-GT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      card.innerHTML = `
        <div class="partido-header">
          <strong>${p["equipo local"]} vs ${p["equipo visitante"]}</strong>
        </div>
        <div class="partido-info">
          <span>${fechaFormateada}</span>
          <span>Estadio: ${p.estadio || "Por confirmar"}</span>
        </div>
        <div class="pronostico">
          ${p["pronóstico ia"] 
            ? p["pronóstico ia"].replace(/\n/g, "<br>") 
            : "Pronóstico no disponible aún"}
        </div>
        <div class="formas">
          Forma: 
          <strong>${p["forma local"] || "?"}</strong> (Local) • 
          <strong>${p["forma visitante"] || "?"}</strong> (Visitante)
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error completo:", error);
    loading.innerHTML = `
      <strong>⚠️ Error al cargar los datos</strong><br><br>
      ${error.message}<br><br>
      <small>Revisa la consola (F12 → Console) y prueba abrir la URL de la API directamente en otra pestaña.<br>
      Posibles causas:<br>
      • La web app no está desplegada como "Cualquiera"<br>
      • El script tarda demasiado (>30s)<br>
      • Problema de red o CORS</small>
    `;
  }
}

// Cargar al abrir la página
window.addEventListener("load", () => {
  console.log("Página cargada → ejecutando cargarDatos()");
  cargarDatos();
});
