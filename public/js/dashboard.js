// Load plants on page load
document.addEventListener('DOMContentLoaded', loadPlants);

async function loadPlants() {
    try {
        const response = await fetch('/api/plants');
        const plants = await response.json();
        
        const grid = document.getElementById('plantsGrid');
        grid.innerHTML = plants.map(plant => `
            <div class="plant-card">
                <div class="health-indicator ${plant.health_status}"></div>
                <div class="plant-image">🌿</div>
                <h3>${plant.name}</h3>
                <p><strong>Species:</strong> ${plant.species || 'Unknown'}</p>
                <p><strong>Owner:</strong> ${plant.username}</p>
                <p><em>Last watered: ${plant.last_watered || 'Never'}</em></p>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="viewPlant(${plant.id})">View</button>
                    <button class="btn-secondary" onclick="waterPlant(${plant.id})">Water Now</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading plants:', error);
    }
}

function addPlant() {
    const name = prompt('Plant name:');
    const species = prompt('Species:');
    
    if (name) {
        fetch('/api/plants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, species, user_id: 1 })
        }).then(() => loadPlants());
    }
}

function viewPlant(id) {
    alert(`Viewing plant ${id} - Full profile coming soon!`);
}

function waterPlant(id) {
    alert(`💧 Watered plant ${id}! Log updated.`);
}