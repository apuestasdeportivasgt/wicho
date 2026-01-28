const API_URL = "https://script.google.com/macros/s/AKfycbxlXuDL9bOXY8ogCJvhck3keo5g1TZ56uWbVktOtXnQ9XfoMaT-BGNPavnX3TuSRM_AZw/exec";
let allMatches = [];
let currentPage = 0;
const PAGE_SIZE = 4;

async function init() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Unificar todos los partidos de todas las ligas en un solo array
        allMatches = [];
        Object.keys(data.calendario).forEach(liga => {
            data.calendario[liga].forEach(match => allMatches.push(match));
        });

        renderPage();
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error("Error cargando datos", error);
    }
}

function renderPage() {
    const container = document.getElementById('grid-partidos');
    container.innerHTML = "";
    
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const currentMatches = allMatches.slice(start, end);

    currentMatches.forEach(m => {
        const fecha = new Date(m.fecha);
        const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Extraer recomendación (primeras líneas del pronóstico)
        const recCorta = m["pronóstico ia"].split('\n').find(l => l.includes('%')) || "Ver análisis";

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-top">
                <span>${m.liga.replace(/_/g, ' ')}</span>
                <span>${hora}</span>
            </div>
            <div class="match-vs">
                <div class="team-box">
                    <img src="https://logo.clearbit.com/${m["equipo local"].toLowerCase().replace(/ /g, '')}.com?size=100" onerror="this.src='https://ui-avatars.com/api/?name=${m["equipo local"]}'">
                    <span class="team-name">${m["equipo local"]}</span>
                </div>
                <div style="color: var(--primary); font-weight: bold;">VS</div>
                <div class="team-box">
                    <img src="https://logo.clearbit.com/${m["equipo visitante"].toLowerCase().replace(/ /g, '')}.com?size=100" onerror="this.src='https://ui-avatars.com/api/?name=${m["equipo visitante"]}'">
                    <span class="team-name">${m["equipo visitante"]}</span>
                </div>
            </div>
            <div style="font-size: 0.7rem; text-align: center; color: #8b949e; margin-bottom: 10px;">🏟️ ${m.estadio}</div>
            <div class="card-footer">${recCorta}</div>
        `;
        
        card.onclick = () => showModal(m);
        container.appendChild(card);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(allMatches.length / PAGE_SIZE);
    document.getElementById('page-indicator').innerText = `Página ${currentPage + 1} de ${totalPages}`;
    document.getElementById('prev-btn').disabled = currentPage === 0;
    document.getElementById('next-btn').disabled = (currentPage + 1) >= totalPages;
}

function showModal(m) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-data');
    
    content.innerHTML = `
        <h2 style="color: var(--primary); margin-bottom: 10px;">${m["equipo local"]} vs ${m["equipo visitante"]}</h2>
        <p style="color: var(--subtext); margin-bottom: 20px;">${m.liga.replace(/_/g, ' ')} | ${m.estadio}</p>
        <hr style="border: 0; border-top: 1px solid #30363d; margin-bottom: 20px;">
        <div style="line-height: 1.6; font-size: 0.95rem;">
            ${m["pronóstico ia"].replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top: 25px; display: flex; gap: 10px;">
            <div style="flex: 1; background: #21262d; padding: 15px; border-radius: 10px;">
                <strong>Forma Local:</strong><br><span style="color: var(--primary)">${m["forma local"]}</span>
            </div>
            <div style="flex: 1; background: #21262d; padding: 15px; border-radius: 10px;">
                <strong>Forma Visita:</strong><br><span style="color: var(--primary)">${m["forma visitante"]}</span>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

// Eventos de botones
document.getElementById('next-btn').onclick = () => { currentPage++; renderPage(); };
document.getElementById('prev-btn').onclick = () => { currentPage--; renderPage(); };
document.querySelector('.close-btn').onclick = () => document.getElementById('modal').style.display = 'none';
window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };

init();
