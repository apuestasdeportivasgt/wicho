const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";

async function cargarDatos() {
    const container = document.getElementById("partidos-container");
    const loading = document.getElementById("loading");
    const noData = document.getElementById("no-data");

    try {
        loading.classList.remove("hidden");
        container.classList.add("hidden");

        const response = await fetch(API_URL);
        const data = await response.json();

        container.innerHTML = "";
        let count = 0;

        // Iterar ligas
        Object.entries(data.calendario || {}).forEach(([liga, partidos]) => {
            partidos.forEach(p => {
                const card = document.createElement("div");
                
                // Extraer probabilidad para lógica de diseño
                const pronosticoText = p["pronóstico ia"] || "";
                const probMatch = pronosticoText.match(/(\d+)%/);
                const porcentaje = probMatch ? parseInt(probMatch[1]) : 0;

                // Si la probabilidad es > 75%, aplicar clase especial
                card.className = `match-card ${porcentaje >= 75 ? 'high-confidence' : ''}`;
                
                const fecha = new Date(p.fecha);
                const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                card.innerHTML = `
                    <div class="match-header">
                        ${p["equipo local"]} <span class="match-vs">vs</span> ${p["equipo visitante"]}
                    </div>
                    <div class="match-info">
                        ${liga.replace(/_/g, ' ')} • ${hora}
                    </div>
                    <div class="match-prob">
                        ${porcentaje > 0 ? porcentaje + '% Probabilidad' : 'Analizando...'}
                    </div>
                `;

                card.onclick = () => abrirModal(p);
                container.appendChild(card);
                count++;
            });
        });

        document.getElementById("last-update").textContent = new Date().toLocaleTimeString();
        
        loading.classList.add("hidden");
        if (count > 0) {
            container.classList.remove("hidden");
        } else {
            noData.classList.remove("hidden");
        }

    } catch (error) {
        console.error("Error:", error);
        loading.innerHTML = "<p>Error de conexión con la IA</p>";
    }
}

function abrirModal(p) {
    const modal = document.getElementById("modal");
    document.getElementById("modal-title").textContent = `${p["equipo local"]} vs ${p["equipo visitante"]}`;
    document.getElementById("modal-stadium").textContent = p.estadio || "Estadio TBC";
    document.getElementById("modal-pronostico").innerHTML = (p["pronóstico ia"] || "Pendiente").replace(/\n/g, "<br>");
    
    document.getElementById("modal-formas").innerHTML = `
        <p><strong>Forma Local:</strong> ${p["forma local"] || 'N/A'}</p>
        <p><strong>Forma Visita:</strong> ${p["forma visitante"] || 'N/A'}</p>
    `;

    modal.classList.add("active");
}

// Cerrar Modal
document.querySelector(".modal-close").onclick = () => {
    document.getElementById("modal").classList.remove("active");
};

window.onclick = (e) => {
    if (e.target == document.getElementById("modal")) {
        document.getElementById("modal").classList.remove("active");
    }
};

document.getElementById("refresh-btn").onclick = cargarDatos;
document.addEventListener("DOMContentLoaded", cargarDatos);
