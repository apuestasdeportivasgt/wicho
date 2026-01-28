// script.js
const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec"; // ← CAMBIA ESTO

async function cargarDatos() {
  const loading = document.getElementById("loading");
  const container = document.getElementById("partidos-container");
  const noData = document.getElementById("no-data");

  try {
    loading.classList.remove("hidden");
    container.classList.add("hidden");
    noData.classList.add("hidden");

    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    loading.classList.add("hidden");

    // Limpiamos contenedor
    container.innerHTML = "";

    // Filtro actual (por defecto todas)
    const filtroLiga = document.getElementById("liga-filter")?.value || "all";

    let partidosMostrados = 0;

    Object.entries(data.calendario || {}).forEach(([liga, partidos]) => {
      if (filtroLiga !== "all" && liga !== filtroLiga) return;
      if (partidos.length === 0) return;

      const titulo = document.createElement("h3");
      titulo.className = "liga-title";
      titulo.textContent = liga.replace(/_/g, " ");
      container.appendChild(titulo);

      partidos.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        const fecha = new Date(p.fecha);
        const fechaStr = fecha.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
        const horaStr = fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true });

        card.innerHTML = `
          <div class="partido-header">
            ${p["equipo local"]} <span style="color:#00ff88">vs</span> ${p["equipo visitante"]}
          </div>
          <div class="partido-info">
            <div>${fechaStr} • ${horaStr}</div>
            <div>Estadio: ${p.estadio || "Por confirmar"}</div>
          </div>
          <div class="pronostico">
            ${p["pronóstico ia"]?.replace(/\n/g, "<br>") || "Análisis en proceso..."}
          </div>
          <div class="formas">
            Forma: <strong>${p["forma local"] || "?"}</strong> (L) • <strong>${p["forma visitante"] || "?"}</strong> (V)
          </div>
        `;

        container.appendChild(card);
        partidosMostrados++;
      });
    });

    container.classList.remove("hidden");

    if (partidosMostrados === 0) {
      noData.classList.remove("hidden");
    }

  } catch (err) {
    console.error(err);
    loading.innerHTML = `Error: ${err.message}<br>Revisa consola (F12) o prueba la URL directamente.`;
  }
}

// Filtro y refresh
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();

  document.getElementById("refresh-btn")?.addEventListener("click", cargarDatos);

  document.getElementById("liga-filter")?.addEventListener("change", cargarDatos);
});
