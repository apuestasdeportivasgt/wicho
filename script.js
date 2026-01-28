// 1. COLOCA TU URL DE GOOGLE AQUÍ
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";

let allMatches = [];
let currentPage = 0;
const PAGE_SIZE = 4;

// Función para normalizar nombres y comparar mejor
const normalize = (name) => name ? name.trim().toLowerCase() : '';

// 2. Función principal para cruzar Calendario con Logos
function processData(data) {
    const processed = [];
    const ligas = data.ligas; // Donde están los equipos con logoUrl
    const calendario = data.calendario; // Donde están los partidos

    Object.keys(calendario).forEach(ligaKey => {
        calendario[ligaKey].forEach(match => {
            // Buscamos el logo en la sección "ligas" del JSON
            const teamHome = ligas[ligaKey]?.find(t => normalize(t.name) === normalize(match["equipo local"]));
            const teamAway = ligas[ligaKey]?.find(t => normalize(t.name) === normalize(match["equipo visitante"]));

            processed.push({
                ...match,
                logoLocal: teamHome?.logoUrl || 'https://via.placeholder.com/50?text=?',
                logoVisit: teamAway?.logoUrl || 'https://via.placeholder.com/50?text=?'
            });
        });
    });
    return processed;
}

// 3. Renderizar las 4 fichas
function renderGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = "";
    
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = allMatches.slice(start, end);

    items.forEach(m => {
        const fecha = new Date(m.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const card = document.createElement('div');
        card.className = 'ficha-partido';
        card.innerHTML = `
            <div class="info-header">
                <span>${m.liga.replace(/_/g, ' ')}</span>
                <span>${fechaStr} - ${horaStr}</span>
            </div>
            <div class="equipos-container">
                <div class="equipo-box">
                    <img src="${m.logoLocal}" class="logo-equipo" alt="Logo">
                    <span class="nombre-equipo">${m["equipo local"]}</span>
                </div>
                <div class="vs-badge">VS</div>
                <div class="equipo-box">
                    <img src="${m.logoVisit}" class="logo-equipo" alt="Logo">
                    <span class="nombre-equipo">${m["equipo visitante"]}</span>
                </div>
            </div>
            <div class="estadio-footer">
                🏟️ ${m.estadio}
            </div>
        `;
        card.onclick = () => openModal(m);
        container.appendChild(card);
    });

    // Actualizar botones y contador
    const totalPages = Math.ceil(allMatches.length / PAGE_SIZE);
    document.getElementById('prev-btn').disabled = currentPage === 0;
    document.getElementById('next-btn').disabled = (currentPage + 1) >= totalPages;
    document.getElementById('page-indicator').innerText = `${currentPage + 1} / ${totalPages}`;
}

// 4. Modal con el análisis de la IA
function openModal(m) {
    const modal = document.getElementById('modal-pronostico');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <h2 style="color:var(--primary); margin-top:0;">${m["equipo local"]} vs ${m["equipo visitante"]}</h2>
        <p style="color:#8b949e; font-size:0.9rem; margin-bottom:20px;">${m.liga} | ${m.estadio}</p>
        <div style="background:#0d1117; padding:20px; border-radius:12px; border:1px solid #30363d; line-height:1.7;">
            ${m["pronóstico ia"].replace(/\n/g, '<br>')}
        </div>
    `;
    modal.style.display = 'block';
}

// 5. Carga inicial
async function init() {
    try {
        const response = await fetch(`${WEBAPP_URL}?tipo=todo`);
        const data = await response.json();
        
        allMatches = processData(data);
        renderGrid();
    } catch (error) {
        console.error("Error cargando API:", error);
        document.getElementById('grid-container').innerHTML = `<p style="color:red">Error al cargar datos. Verifica la URL de la API.</p>`;
    }
}

// Navegación y Cierre
document.getElementById('next-btn').onclick = () => { currentPage++; renderGrid(); };
document.getElementById('prev-btn').onclick = () => { currentPage--; renderGrid(); };
document.querySelector('.close-modal').onclick = () => document.getElementById('modal-pronostico').style.display = 'none';
window.onclick = (e) => { if(e.target.className === 'modal-overlay') e.target.style.display = 'none'; };

init();
