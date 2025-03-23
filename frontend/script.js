const showDinosaursBtn = document.getElementById('showDinosaursBtn');
const container = document.querySelector('.container');

async function fetchAndDisplayDinosaurs() {
    try {
        const response = await fetch('http://localhost:3000/dinos'); // to update
        if (!response.ok) {
            throw new Error('Failed to fetch dinosaurs');
        }

        const dinosaurs = await response.json();
        const list = document.createElement('ul');

        dinosaurs.forEach(dino => {
            const listItem = document.createElement('li'); 
            listItem.textContent = dino.name;
            list.appendChild(listItem);
        });

        container.appendChild(list);
    } catch (error) {
        console.error('Error:', error);
    }
}

showDinosaursBtn.addEventListener('click', fetchAndDisplayDinosaurs);
