const loadDinoTableBtn = document.getElementById('loadDinoTable');
const dinoTableContainer = document.getElementById('dinoTableContainer');

async function fetchAndDisplayDinoTable() {
    try {
        const response = await fetch('http://localhost:3000/api/dinos');
        if (!response.ok) throw new Error('Failed to fetch dinosaurs');

        const result = await response.json();
        const dinos = result.data;

        dinoTableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('dino-table');

        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Name', 'Species', 'Description', 'Era', 'Diet', 'Size', 'Weight', 'Environment', 'Category', 'Image URL', 'Actions'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        dinos.forEach(dino => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dino.id}</td>
                <td>${dino.name}</td>
                <td>${dino.species}</td>
                <td>${dino.description}</td>
                <td>${dino.era}</td>
                <td>${dino.diet}</td>
                <td>${dino.size}</td>
                <td>${dino.weight}</td>
                <td>${dino.environments}</td>
                <td>${dino.categories}</td>
                <td>${dino.image_url}</td>
            `;

            const actionsTd = document.createElement('td');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edytuj';
            editBtn.classList.add('btn-edit');
            editBtn.onclick = () => showDinoForm(dino);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Usuń';
            deleteBtn.classList.add('btn-delete');
            deleteBtn.onclick = () => deleteDino(dino.id);

            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(deleteBtn);
            row.appendChild(actionsTd);

            table.appendChild(row);
        });

        const addBtn = document.createElement('button');
        addBtn.textContent = 'Dodaj dinozaura';
        addBtn.onclick = () => showDinoForm();
        dinoTableContainer.appendChild(addBtn);

        dinoTableContainer.appendChild(table);

    } catch (error) {
        console.error('Błąd:', error);
        dinoTableContainer.textContent = 'Nie udało się załadować dinozaurów.';
    }
}

async function deleteDino(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Brak tokenu. Zaloguj się ponownie.');
        return;
    }
    if (!confirm(`Na pewno chcesz usunąć dinozaura o ID ${id}?`)) return;
    try {
        const response = await fetch(`http://localhost:3000/api/admin/dinos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Błąd usuwania dinozaura');
        alert(`Dinozaur ID ${id} został usunięty.`);
        fetchAndDisplayDinoTable();
    } catch (err) {
        console.error('Delete error:', err);
        alert('Błąd podczas usuwania.');
    }
}

function showDinoForm(dino = null) {
    fetchMetadata().then(() => {
        document.getElementById('dinoFormContainer').style.display = 'block';
        document.getElementById('formTitle').textContent = dino ? 'Edytuj dinozaura' : 'Dodaj dinozaura';

        document.getElementById('dinoId').value = dino?.id || '';
        document.getElementById('dinoName').value = dino?.name || '';
        document.getElementById('dinoDescription').value = dino?.description || '';
        document.getElementById('dinoSize').value = dino?.size || '';
        document.getElementById('dinoWeight').value = dino?.weight || '';
        document.getElementById('dinoImageUrl').value = dino?.image_url || '';

        if (dino) {
            document.getElementById('dinoSpeciesId').value = dino.species_id;
            document.getElementById('dinoDietId').value = dino.diet_id;
            document.getElementById('dinoEraId').value = dino.era_id;

            // Multiselect pre-selection
            setMultiSelect('dinoCategories', dino.categories); // array of ids
            setMultiSelect('dinoEnvironments', dino.environments);
        }
    });
}

function setMultiSelect(id, values = []) {
    const select = document.getElementById(id);
    Array.from(select.options).forEach(opt => {
        opt.selected = values.includes(parseInt(opt.value));
    });
}

function hideDinoForm() {
    document.getElementById('dinoFormContainer').style.display = 'none';
}

document.getElementById('dinoForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Brak tokenu. Zaloguj się ponownie.');
        return;
    }

    const dino = {
        name: document.getElementById('dinoName').value,
        description: document.getElementById('dinoDescription').value,
        size: document.getElementById('dinoSize').value,
        weight: document.getElementById('dinoWeight').value,
        image_url: document.getElementById('dinoImageUrl').value,
        species_id: Number(document.getElementById('dinoSpeciesId').value),
        diet_id: Number(document.getElementById('dinoDietId').value),
        era_id: Number(document.getElementById('dinoEraId').value),
        categories: Array.from(document.getElementById('dinoCategories').selectedOptions).map(o => Number(o.value)),
        environments: Array.from(document.getElementById('dinoEnvironments').selectedOptions).map(o => Number(o.value))
    };

    const id = document.getElementById('dinoId').value;
    const url = id
        ? `http://localhost:3000/api/admin/dinos/${id}`
        : `http://localhost:3000/api/admin/dinos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dino)
        });

        if (!response.ok) throw new Error('Nie udało się zapisać dinozaura');

        alert('Dinozaur zapisany pomyślnie!');
        hideDinoForm();
        fetchAndDisplayDinoTable();
    } catch (error) {
        console.error('Save error:', error);
        alert('Wystąpił błąd przy zapisie.');
    }
});

loadDinoTableBtn.addEventListener('click', fetchAndDisplayDinoTable);

const loadUsersTableBtn = document.getElementById('loadUsersTable');
loadUsersTableBtn.addEventListener('click', fetchAndDisplayUsersTable);

async function fetchAndDisplayUsersTable() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Brak tokenu. Zaloguj się ponownie.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/users', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Nie udało się pobrać użytkowników');

        const result = await response.json();
        const users = result.data;

        dinoTableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('user-table');

        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Username', 'Email', 'Role', 'Created At'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
            `;
            table.appendChild(row);
        });

        dinoTableContainer.appendChild(table);

    } catch (error) {
        console.error('Błąd:', error);
        dinoTableContainer.textContent = 'Nie udało się załadować użytkowników.';
    }
}

const loadVotesTableBtn = document.getElementById('loadVotesTable');
loadVotesTableBtn.addEventListener('click', fetchAndDisplayVotesTable);

async function fetchAndDisplayVotesTable() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Brak tokenu. Zaloguj się ponownie.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/vote', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Nie udało się pobrać głosów');

        const result = await response.json();
        const votes = result.data;

        dinoTableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('vote-table');

        const headerRow = document.createElement('tr');
        const headers = ['Vote ID', 'User ID', 'Dino ID', 'Vote Value', 'Created At'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        votes.forEach(vote => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vote.id}</td>
                <td>${vote.userId}</td>
                <td>${vote.dinoId}</td>
                <td>${vote.value}</td>
                <td>${new Date(vote.createdAt).toLocaleString()}</td>
            `;
            table.appendChild(row);
        });

        dinoTableContainer.appendChild(table);

    } catch (error) {
        console.error('Błąd:', error);
        dinoTableContainer.textContent = 'Nie udało się załadować głosów.';
    }
}

let metadata = {};

async function fetchMetadata() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3000/api/admin/metadata', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Nie udało się pobrać metadanych');
        metadata = await res.json();

        populateSelect('dinoSpeciesId', metadata.species);
        populateSelect('dinoDietId', metadata.diets);
        populateSelect('dinoEraId', metadata.eras);
        populateSelect('dinoCategories', metadata.categories);
        populateSelect('dinoEnvironments', metadata.environments);
    } catch (err) {
        console.error('Metadata error:', err);
    }
}

function populateSelect(id, options) {
    const select = document.getElementById(id);
    select.innerHTML = '';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = opt.name;
        select.appendChild(option);
    });
}

