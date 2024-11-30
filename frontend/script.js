const myForm = document.querySelector("#my-form");
const stateComboBox = document.querySelector("#state-combo-box");
const municipalityComboBox = document.querySelector("#municipality-combo-box");
const mySVG = document.querySelector("#my-svg");

const renderState = data => {
    const statePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    statePath.setAttribute("d", data.statePath);
    statePath.setAttribute("id", "state-path");
    statePath.setAttribute("stroke", "black");
    statePath.setAttribute("stroke-width", "0.01");
    statePath.setAttribute("fill", "#8bc34a");
    statePath.setAttribute("fill-opacity", "0.75");
    return statePath;
}

const renderMunicipality = data => {
    const municipalityPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    municipalityPath.setAttribute("d", data.municipalityPath);
    municipalityPath.setAttribute("id", "municipality-path");
    municipalityPath.setAttribute("fill", "red");
    return municipalityPath;
}

async function fetchStates() {
    let states = [];
        await fetch(`http://servicodados.ibge.gov.br/api/v1/localidades/estados`)
            .then(response => response.json())
            .then(data => {
                states = data.map(element => {
                    return { id: element.id, name: element.nome };
                });
            })
            .catch(e => {
                console.error("Error searching states in IBGE API: " + e);
                throw e;
            });
            
    states.sort((a, b) => {
        if(a.name > b.name) return 1;
        if(a.name < b.name) return -1;
        return 0;
    });
    
    return states;
}

async function createStateOptionsCB() {
    try {
        const states = await fetchStates();
        
        for(let i = 0; i < states.length; i++) {
            const newOption = document.createElement("option");
            newOption.setAttribute("value", states[i].id);
            newOption.textContent = states[i].name;

            stateComboBox.appendChild(newOption);
        }
    } catch(e) {
        console.error(e.message);
        alert("Falha ao criar opções do seletor de estados");
    }
}

async function fetchMunicipalities() {
    let municipalities = [];

    const selectedOption = stateComboBox.options[stateComboBox.selectedIndex];

    const stateId = selectedOption.getAttribute("value");
    await fetch(`http://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
        .then(response => response.json())
        .then(data => {
            municipalities = data.map(element => {
                return { id: element.id, name: element.nome };
            })
        })
        .catch(e => {
            console.error("Error searching municipalities in IBGE API: " + e);
            throw e;
        });

    municipalities.sort((a, b) => {
        if(a.name > b.name) return 1;
        if(a.name < b.name) return -1;
        return 0;
    });
    
    return municipalities;
}

async function createMunicipalityOptionCB() {
    try {
        const municipalities = await fetchMunicipalities();
        
        for(let i = 0; i < municipalities.length; i++) {
            const newOption = document.createElement("option");
            newOption.setAttribute("value", municipalities[i].id);
            newOption.textContent = municipalities[i].name;

            municipalityComboBox.appendChild(newOption);
        }

    } catch(e) {
        console.error(e.message);
        alert("Falha ao criar opções do seletor de municípios");
    }
}

createStateOptionsCB();

stateComboBox.addEventListener("change", async () => {
    municipalityComboBox.replaceChildren(document.querySelector("#municipality-default"));
    municipalityComboBox.selectedIndex = 0;
    createMunicipalityOptionCB();
});

myForm.addEventListener("submit", e => {
    e.preventDefault();

    const choosedState = stateComboBox.options[stateComboBox.selectedIndex];
    const choosedMunicipality = municipalityComboBox.options[municipalityComboBox.selectedIndex];
    
    const stateId = choosedState.value;
    const municipalityId = choosedMunicipality.value;

    fetch(`http://localhost:3000/shapes/${stateId}/${municipalityId}`)
        .then(async response => {
            if(!response.ok) {
                const e = await response.json();
                throw new Error(e.error);
            }
            return response.json();
        })
        .then(data => {
            mySVG.setAttribute("viewBox", data.viewBox);

            if(!document.querySelector("#state-path"))
                mySVG.appendChild(renderState(data));
            else mySVG.replaceChild(renderState(data), document.querySelector("#state-path"));
            
            if(!document.querySelector("#municipality-path"))
                mySVG.appendChild(renderMunicipality(data));
            else mySVG.replaceChild(renderMunicipality(data), document.querySelector("#municipality-path"));
        })
        .catch(e => {
            alert(e);
        });
});