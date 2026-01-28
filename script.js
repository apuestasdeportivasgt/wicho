// ←←← Pega aquí tu URL de la web app (la que termina en /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";

async function cargarDatos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al cargar datos");

    const data = await response.json();

    // Quitamos el loading
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("calendario").classList.remove("hidden");

    const container = document.getElementById("partidos-container");
    container.innerHTML = ""; // limpiamos

    // Recorremos cada liga que tenga partidos
    Object.entries(data.calendario || {}).forEach(([liga, partidos]) => {
      if (!partidos || !partidos.length) return;

      const ligaTitle = document.createElement("h3");
      ligaTitle.textContent = liga.replace(/_/g, " ");
      container.appendChild(ligaTitle);

      partidos.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <strong>${p['equipo local']} vs ${p['equipo visitante']}</strong><br>
          <small>${new Date(p.isodate).toLocaleString('es-GT', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })} – ${p.liga}</small>
          <div class="pronostico">
            ${p.pronóstico ? p.pronóstico.replace(/\n/g, "<br>") : "Sin pronóstico aún"}
          </div>
          <small>Forma: ${p['forma local'] || '?'} (Local) • ${p['forma visitante'] || '?'} (Visitante)</small>
        `;

        container.appendChild(card);
      });
    });

  } catch (error) {
    console.error(error);
    document.getElementById("loading").innerHTML = 
      "⚠️ Error al cargar los datos. Revisa la consola o la URL de la API.";
  }
}

// ¡Cargamos al abrir la página!
window.addEventListener("load", cargarDatos);
