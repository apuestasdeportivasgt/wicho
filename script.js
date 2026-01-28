const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";

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
    container.innerHTML = "";

    let partidosMostrados = 0;

    Object.entries(data.calendario || {}).forEach(([liga, partidos]) => {
      if (partidos.length === 0) return;

      partidos.forEach(p => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.dataset.fullData = JSON.stringify(p); // guardamos todo el objeto para el modal

        const fecha = new Date(p.fecha);
        const hora = fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Extraemos la recomendación principal (ej: la de mayor probabilidad en 1X2)
        const pronosticoText = p["pronóstico ia"] || "";
        const probMatch = pronosticoText.match(/(\d+)% para ([^(\n]*)/);
        const recomendacion = probMatch ? `${probMatch[1]}% ${probMatch[2]}` : "Ver detalle";

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

        // Abrir modal al clic
        card.addEventListener("click", () => abrirModal(p));

        container.appendChild(card);
        partidosMostrados++;
      });
    });

    if (partidosMostrados > 0) {
      container.classList.remove("hidden");
    } else {
      noData.classList.remove("hidden");
    }

  } catch (err) {
    loading.innerHTML = `Error: ${err.message}<br>Revisa consola (F12)`;
    console.error(err);
  }
}

function abrirModal(partido) {
  const modal = document.getElementById("modal");
  const title = document.getElementById("modal-title");
  const dateEl = document.getElementById("modal-date");
  const stadiumEl = document.getElementById("modal-stadium");
  const pronosticoEl = document.getElementById("modal-pronostico");
  const formasEl = document.getElementById("modal-formas");

  title.textContent = `${partido["equipo local"]} vs ${partido["equipo visitante"]}`;

  const fecha = new Date(partido.fecha);
  dateEl.textContent = fecha.toLocaleString('es-GT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  stadiumEl.textContent = `Estadio: ${partido.estadio || "Por confirmar"}`;

  pronosticoEl.innerHTML = partido["pronóstico ia"]?.replace(/\n/g, "<br>") || "Sin análisis disponible";

  formasEl.innerHTML = `
    <strong>Forma reciente:</strong><br>
    ${partido["forma local"] || "?"} (Local) • ${partido["forma visitante"] || "?"} (Visitante)
  `;

  modal.classList.remove("hidden");
  modal.classList.add("active");

  // Cerrar modal
  const closeBtn = document.querySelector(".modal-close");
  const closeModal = () => {
    modal.classList.remove("active");
    modal.classList.add("hidden");
  };

  closeBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  document.getElementById("refresh-btn")?.addEventListener("click", cargarDatos);
});
