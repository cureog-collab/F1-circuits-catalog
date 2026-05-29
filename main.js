const catalogContainer = document.querySelector('.catalog');
const searchBar = document.getElementById('main-search-bar');
const closeBtn = document.getElementById('close-detail-viewer');

let globalCirtData = [];

// get data from various .json files
async function fetchCircuitData() {
    try {

        const imageMap = await (await fetch('image-map.json')).json();
        const jolpicaf1Data = await (await fetch('https://api.jolpi.ca/ergast/f1/circuits.json?limit=100')).json();
        
        // circuits from jolpicaf1 api
        const jolpicaf1CirtArray = jolpicaf1Data.MRData.CircuitTable.Circuits;
        
        // circuits that are not included in jolpicaf1 data (hardcoded in another .json file)
        const customCirts = await (await fetch('custom-circuits.json')).json();

        // merge the two arrays
        const combinedCirtList = [...jolpicaf1CirtArray, ...customCirts];

        // merge the images with the circuits list
        globalCirtData = combinedCirtList.map((circuit) => {
            let currId = circuit.circuitId;
            return {
                circuitId: currId,
                circuitName: circuit.circuitName,
                image: imageMap[currId] || 'images/Undefined.png',
                location: circuit.Location.locality + ', ' + circuit.Location.country
            };
        })

        renderTrackImg(globalCirtData);

    } catch (error) {
        console.error("Eror", error);
        catalogContainer.innerHTML = `<p style="color: white;">Cannot download track data.</p>`;
    }
}

// check for upcoming races
async function checkUpcomingRace(cirtId) {
    const upcomingBox = document.querySelector('.d-upcoming-race');

    try {
        // loading state
        upcomingBox.innerHTML = `<span style="color: var(--text-muted);">Downloading circuit data...</span>`;

        // download and decode the current season data
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
        const data = await response.json();

        const currSeasonRaces = data.MRData.RaceTable.Races;

        // find upcoming race data for the selected circuit (if there is any)
        const foundRace = currSeasonRaces.find((race) => race.Circuit.circuitId == cirtId);
        
        upcomingBox.innerHTML = `
            <div style="font-size: 0.9rem; color: var(--text-muted);">Upcoming race</div>
            <div style="font-weight: bold; font-size: 1.2rem; color: ${foundRace ? 'var(--f1-red)' : 'var(--text-muted)'};">
            ${foundRace ? foundRace.raceName + '<br>' + foundRace.date : "Not in the current season!"}
            </div>
        `;
    } catch (error) {
        console.log("Cannot fetch data, error:", error);
        upcomingBox.innerHTML = '<span style="color: red;">Cannot fetch upcoming race data!</span>';
    }
}

// render the circuit cards
function renderTrackImg(tracksList) {
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

    tracksList.forEach(cirt => {
        htmlOutput += `
            <article class="cirt-crd" data-id="${cirt.circuitId}">
                <div class="track-img">
                    <img src="${cirt.image}" loading="lazy" alt="${cirt.circuitName} map">
                </div>
                <div class="grandprix-brief">${cirt.circuitName}</div>
            </article>
        `;
    });
    catalogContainer.innerHTML = htmlOutput;
}

// let user uses the searchbar in the catalog
searchBar.addEventListener('input', (event) => {
    const rawSignal = event.target.value.toLowerCase();
    
    const filteredCirts = globalCirtData.filter((track) => {
        return track.circuitName.toLowerCase().includes(rawSignal);
    });

    renderTrackImg(filteredCirts);
});

// when user clicks on a circuit card
catalogContainer.addEventListener('click', (event) => {
    // check if the user has actually clicked on a valid circuit card
    let clickedCrd = event.target.closest('.cirt-crd');
    if (!clickedCrd) {
        return;
    }
    // turn off main catalog scrollbar (and turn on the detail-viewer scrollbar accordingly, this transition should be seamless)
    document.body.style.overflow = 'hidden';

    // turn on the detail view mode for the clicked card
    document.querySelector('.detail-viewer').classList.add('active');

    // showing details about the selected circuit
    const cirtId = clickedCrd.dataset.id;
    const selectedCirt = globalCirtData.find(circuit => circuit.circuitId === cirtId);
    
    // pass values onto actual grid to show the user
    document.querySelector('.d-layout').innerHTML = '<img src="' + selectedCirt.image + '" alt="Map">';
    document.querySelector('.d-name').textContent = selectedCirt.circuitName;
    document.querySelector('.d-loc').textContent = selectedCirt.location;
    // document.querySelector('.d-est-yr').textContent
    // document.querySelector('.d-best-racer')
    // document.querySelector('.d-upcoming-race').textContent
    // document.querySelector('.d-last-podium')

    checkUpcomingRace(cirtId);
})

// top-nav-btns functions (they act like a filter, only show circuits that are inactiver/ active)

// close button of the detail viewer mode
closeBtn.addEventListener('click', (event) => {
    document.body.style.overflow = '';
    document.querySelector('.detail-viewer').classList.remove('active');
})


fetchCircuitData();