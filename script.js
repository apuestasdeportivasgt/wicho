const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";
let todosLosPartidos = [];
let currentIndex = 0;
const ITEMS_PER_PAGE = 4;

async function fetchData() {
    const loader = document.getElementById("loading");
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Convertir el objeto de ligas en una lista plana de partidos
        todosLosPartidos = [];
        Object.entries(data.calendario).forEach(([liga, partidos]) => {
            partidos.forEach(p => {
                p.ligaNombre = liga.replace(/_/g, " ");
                todosLosPartidos.push(p);
            });
        });

        renderGrid();
        document.getElementById("last-update").textContent = "Actualizado: " + new Date().toLocaleTimeString();
        loader.style.display = "none";
    } catch (e) {
        loader.textContent = "Error al conectar con la IA";
    }
}

function renderGrid() {
    const container = document.getElementById("partidos-grid");
    container.innerHTML = "";
    
    // Obtener solo los 4 partidos actuales
    const pageItems = todosLosPartidos.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);
    
    pageItems.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        
        // Extraer recomendación corta (ej: 75% Local)
        const recCorta = p["pronóstico ia"]?.match(/(\d+%.*)/)?.[0] || "Ver detalle";

        div.innerHTML = `
            <div class="card-header">${p.ligaNombre}</div>
            <div class="teams">${p["equipo local"]} <br> vs <br> ${p["equipo visitante"]}</div>
            <div class="recommendation">${recCorta.substring(0, 20)}</div>
        `;
        
        div.onclick = () => openModal(p);
        container.appendChild(div);
    });

    updateControls();
}

function updateControls() {
    document.getElementById("prev-btn").disabled = currentIndex === 0;
    document.getElementById("next-btn").disabled = currentIndex + ITEMS_PER_PAGE >= todosLosPartidos.length;
    
    const pageNum = Math.floor(currentIndex / ITEMS_PER_PAGE) + 1;
    const totalPages = Math.ceil(todosLosPartidos.length / ITEMS_PER_PAGE);
    document.getElementById("page-indicator").textContent = `${pageNum} / ${totalPages}`;
}

// Navegación
document.getElementById("next-btn").onclick = () => {
    if (currentIndex + ITEMS_PER_PAGE < todosLosPartidos.length) {
        currentIndex += ITEMS_PER_PAGE;
        renderGrid();
    }
};

document.getElementById("prev-btn").onclick = () => {
    if (currentIndex > 0) {
        currentIndex -= ITEMS_PER_PAGE;
        renderGrid();
    }
};

// Modal Funcional
function openModal(p) {
    const m = document.getElementById("modal");
    document.getElementById("m-liga").textContent = p.ligaNombre;
    document.getElementById("m-equipos").textContent = `${p["equipo local"]} vs ${p["equipo visitante"]}`;
    document.getElementById("m-pronostico").innerHTML = p["pronóstico ia"].replace(/\n/g, "<br>");
    document.getElementById("m-estadio").textContent = p.estadio || "N/A";
    document.getElementById("m-fecha").textContent = new Date(p.fecha).toLocaleDateString();
    
    document.getElementById("m-forma-l").textContent = p["forma local"] || "?";
    document.getElementById("m-forma-v").textContent = p["forma visitante"] || "?";

    m.classList.add("active");
}

document.querySelector(".close-modal").onclick = () => {
    document.getElementById("modal").classList.remove("active");
};

// Iniciar
fetchData();
