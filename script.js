// script.js - Pronósticos IA (versión completa con modal y tarjetas pequeñas)

const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";  // ← CAMBIA ESTO por tu URL real

// Función principal para cargar los datos
async function cargarDatos() {
  const loading = document.getElementById("loading");
  const container = document.getElementById("partidos-container");
  const noData = document.getElementById("no-data");

  try {
    // Mostrar loading y ocultar otros
    loading.classList.remove("hidden");
    container.classList.add("hidden");
    noData.classList.add("hidden");

    // Fetch con no-cache para datos frescos
    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Error al conectar con la API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Actualizar hora de última actualización
    document.getElementById("last-update").textContent = new Date().toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Limpiar contenedor
    container.innerHTML = "";

    let partidosMostrados = 0;

    // Recorrer todas las ligas y sus partidos
    Object.entries(data.calendario || {}).forEach(([liga, partidos]) => {
      if (!partidos || partidos.length === 0) return;

      partidos.forEach(p => {
        const card = document.createElement("div");
        card.className = "match-card";
        // Guardamos los datos completos del partido para usarlos en el modal
        card.dataset.partido = JSON.stringify(p);

        const fecha = new Date(p.fecha);
        const hora = fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Extraer recomendación principal (buscamos el porcentaje más alto en 1X2 o similar)
        let recomendacion = "Ver detalle";
        const pronosticoText = p["pronóstico ia"] || "";
        const probMatch = pronosticoText.match(/(\d+)% para ([^(\n]*)/i);
        if (probMatch) {
          recomendacion = `${probMatch[1]}% ${probMatch[2].trim()}`;
        }

        card.innerHTML = `
          <div class="match-header">
            <span>${p["equipo local"]}</span>
            <span class="match-vs">vs</span>
            <span>${p["equipo visitante"]}</span>
          </div>
          <div class="match-info">
            <div>${hora}</div>
            <div>${liga.replace(/_/g, " ")}</div>
          </div>
          <div class="match-prob">${recomendacion}</div>
        `;

        // Abrir modal al hacer clic en la tarjeta
        card.addEventListener("click", () => abrirModal(p));

        container.appendChild(card);
        partidosMostrados++;
      });
    });

    // Mostrar resultados o mensaje vacío
    if (partidosMostrados > 0) {
      container.classList.remove("hidden");
    } else {
      noData.classList.remove("hidden");
    }

    // Ocultar loading
    loading.classList.add("hidden");

  } catch (error) {
    console.error("Error al cargar datos:", error);
    loading.innerHTML = `
      <strong>⚠️ Error al cargar los pronósticos</strong><br><br>
      ${error.message}<br><br>
      <small>Revisa la consola (F12) o prueba abrir la URL de la API directamente.<br>
      Posible causa: la web app no está desplegada como "Cualquiera" o excede tiempo de ejecución.</small>
    `;
  }
}

// Función para abrir el modal con los detalles completos
function abrirModal(partido) {
  const modal = document.getElementById("modal");
  const title = document.getElementById("modal-title");
  const dateEl = document.getElementById("modal-date");
  const stadiumEl = document.getElementById("modal-stadium");
  const pronosticoEl = document.getElementById("modal-pronostico");
  const formasEl = document.getElementById("modal-formas");

  // Título del modal
  title.textContent = `${partido["equipo local"]} vs ${partido["equipo visitante"]}`;

  // Fecha y hora formateada
  const fecha = new Date(partido.fecha);
  dateEl.textContent = fecha.toLocaleString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Estadio
  stadiumEl.textContent = `Estadio: ${partido.estadio || "Por confirmar"}`;

  // Pronóstico completo (con saltos de línea)
  pronosticoEl.innerHTML = partido["pronóstico ia"]
    ? partido["pronóstico ia"].replace(/\n/g, "<br>")
    : "Análisis no disponible en este momento.";

  // Formas de los equipos
  formasEl.innerHTML = `
    <strong>Forma reciente:</strong><br>
    <span style="color:#14ff8c">${partido["forma local"] || "?"}</span> (Local) • 
    <span style="color:#14ff8c">${partido["forma visitante"] || "?"}</span> (Visitante)
  `;

  // Mostrar modal
  modal.classList.remove("hidden");
  modal.classList.add("active");

  // Cerrar modal
  const closeModal = () => {
    modal.classList.remove("active");
    setTimeout(() => modal.classList.add("hidden"), 300); // para que termine la animación
  };

  document.querySelector(".modal-close").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

// Iniciar al cargar la página + botón de refresh
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();

  // Botón de actualizar
  document.getElementById("refresh-btn")?.addEventListener("click", () => {
    cargarDatos();
  });
});
