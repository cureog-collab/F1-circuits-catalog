const catalogContainer = document.querySelector('.catalog');
const searchBar = document.getElementById('main-search-bar');

let globalTracksData = [];

async function fetchCircuitData() {
    try {
        const response = await fetch('data.json');
        
        globalTracksData = await response.json();
        
        renderTrackImg(globalTracksData);

    } catch (error) {
        console.error("Eror", error);
        catalogContainer.innerHTML = `<p style="color: white;">Cannot download track data.</p>`;
    }
}

function renderTrackImg(tracksList)
{
    if (tracksList.length === 0) {
        catalogContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
                <h2 style="color: var(--text-muted); margin-bottom: 0.5rem;">Cannot find any circuit :(</h2>
                <p style="color: var(--text-muted); opacity: 0.7;">Try other keywords (e.g: Italy, Monaco...)</p>
            </div>
        `;
        return;
    }

    let htmlOutput = '';

    tracksList.forEach(track => {
        htmlOutput += `
            <article class="cirt-crd">
                <div class="track-img">
                    <img src="${track.image}" loading="lazy" alt="${track.name} map">
                </div>
                <div class="grandprix-brief">${track.name}</div>
            </article>
        `;
    });
    catalogContainer.innerHTML = htmlOutput;
}

searchBar.addEventListener('input', (event) => {
    const rawSignal = event.target.value.toLowerCase();
    
    const filteredTracks = globalTracksData.filter((track) => {
        return track.name.toLowerCase().includes(rawSignal);
    });

    renderTrackImg(filteredTracks);
});

// function pressedOnCard()
// active the main-viewer
// disable the catalog scrollbar & enable the main-viewer scrollbar

// closeBtn.addEventListener('input')

fetchCircuitData(globalTracksData);