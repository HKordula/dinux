const showDinosaursBtn = document.getElementById('showDinosaursBtn');
const container = document.querySelector('.container');

async function fetchAndDisplayDinosaurs() {
    try {
        const response = await fetch('/dinos');
        if (!response.ok) {
            throw new Error('Failed to fetch dinosaurs');
        }

        const dinosaurs = await response.json();
        const list = document.createElement('ul');

        dinosaurs.forEach(dino => {
            const listItem = document.createElement('li'); 
            listItem.textContent = dino.name;

            const button = document.createElement('button');
            button.textContent = 'Details';
            button.addEventListener('click', () => fetchDinosaurDetails(dino.id));

            listItem.appendChild(button);
            list.appendChild(listItem);
        });

        container.appendChild(list);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchDinosaurDetails(id) {
   try {
    const response = await fetch(`http://localhost:3000/dinos/${id}`);
    if (!response.ok){
        throw new Error('Failed to fetch dinosaur details');
    }

    const dino = await response.json();

    const details = document.createElement('div');
    details.innerHTML = `
        <h3>${dino.name}</h3>
        <p>ID: ${dino.id}</p> 
        <p>diet: ${dino.diet}</p> 
    `;

    const existingDetails = document.querySelector('.dino-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    details.classList.add('dino-details');
    container.appendChild(details);
   } catch (error) {
    console.error('Error: ', error);
   }
}

showDinosaursBtn.addEventListener('click', fetchAndDisplayDinosaurs);
