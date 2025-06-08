import { apiRequest } from './utils.js';

const dinoTableContainer = document.getElementById('dinoTableContainer');

// Modal elements
const dinoModal = document.getElementById('dinoModal');
const closeDinoModal = document.getElementById('closeDinoModal');
const dinoModalForm = document.getElementById('dinoModalForm');
const cancelDinoModal = document.getElementById('cancelDinoModal');
const modalFormTitle = document.getElementById('modalFormTitle');
const modalDinoImageUrl = document.getElementById('modalDinoImageUrl');
const modalDinoImagePreview = document.getElementById('modalDinoImagePreview');

const userEditModal = document.getElementById('userEditModal');
const closeUserEditModal = document.getElementById('closeUserEditModal');
const userEditForm = document.getElementById('userEditForm');
const cancelUserEditModal = document.getElementById('cancelUserEditModal');
const editUserId = document.getElementById('editUserId');
const editUserRole = document.getElementById('editUserRole');

let metadata = {};

// --- DINOSAURS ---
async function fetchAndDisplayDinoTable() {
  try {
    const dinos = (await apiRequest('/api/dinos')).data;
    dinoTableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('dino-table');

    const headers = ['ID', 'Name', 'Species', 'Description', 'Era', 'Diet', 'Size', 'Weight', 'Environment', 'Category', 'Image', 'Actions'];
    table.appendChild(createHeaderRow(headers));

    dinos.forEach(dino => {
        const row = document.createElement('tr');

        // map category/environment IDs to names
        const categoryNames = (dino.categories || [])
            .map(id => (metadata.categories.find(c => c.id === id) || {}).name)
            .filter(Boolean)
            .join(', ');

        const environmentNames = (dino.environments || [])
            .map(id => (metadata.environments.find(e => e.id === id) || {}).name)
            .filter(Boolean)
            .join(', ');

        row.innerHTML = `
            <td>${dino.id}</td>
            <td>${dino.name}</td>
            <td>${dino.species}</td>
            <td>${dino.description}</td>
            <td>${dino.era}</td>
            <td>${dino.diet}</td>
            <td>${dino.size}</td>
            <td>${dino.weight}</td>
            <td>${environmentNames}</td>
            <td>${categoryNames}</td>
            <td>${
            dino.image_url
                ? `<a href="${dino.image_url}" target="_blank" rel="noopener">
                    <img src="${dino.image_url}" alt="${dino.name}" style="max-width:80px;max-height:60px;">
                </a>`
                : ''
            }</td>
        `;
        const actionsTd = document.createElement('td');
        actionsTd.appendChild(createButton('Edytuj', () => showDinoModal(dino)));
        actionsTd.appendChild(createButton('Usuń', () => deleteDino(dino.id), 'btn-delete'));
        row.appendChild(actionsTd);
        table.appendChild(row);
        });

    const addBtn = createButton('Dodaj dinozaura', () => showDinoModal());
    dinoTableContainer.appendChild(addBtn);
    dinoTableContainer.appendChild(table);

  } catch (error) {
    handleError('Nie udało się załadować dinozaurów.', error);
  }
}

// --- MODAL LOGIC ---
function showDinoModal(dino = null) {
  fetchMetadata().then(() => {
    dinoModal.style.display = 'block';
    modalFormTitle.textContent = dino ? 'Edytuj dinozaura' : 'Dodaj dinozaura';
    dinoModalForm.reset();
    document.getElementById('modalDinoId').value = dino?.id || '';
    document.getElementById('modalDinoName').value = dino?.name || '';
    document.getElementById('modalDinoDescription').value = dino?.description || '';
    document.getElementById('modalDinoSize').value = dino?.size || '';
    document.getElementById('modalDinoWeight').value = dino?.weight || '';
    document.getElementById('modalDinoImageUrl').value = dino?.image_url || '';
    modalDinoImagePreview.style.display = dino?.image_url ? 'block' : 'none';
    modalDinoImagePreview.src = dino?.image_url || '';
    if (dino) {
      document.getElementById('modalDinoSpeciesId').value = dino.species_id;
      document.getElementById('modalDinoDietId').value = dino.diet_id;
      document.getElementById('modalDinoEraId').value = dino.era_id;

      let catVals = [];
      if (Array.isArray(dino.categories)) {
        catVals = dino.categories.map(c => typeof c === 'object' ? c.id : Number(c));
      } else if (typeof dino.categories === 'string') {
        catVals = dino.categories.split(',').map(Number);
      }
      setMultiSelect('modalDinoCategories', catVals);

      let envVals = [];
      if (Array.isArray(dino.environments)) {
        envVals = dino.environments.map(e => typeof e === 'object' ? e.id : Number(e));
      } else if (typeof dino.environments === 'string') {
        envVals = dino.environments.split(',').map(Number);
      }
      setMultiSelect('modalDinoEnvironments', envVals);
    }
  });
}

function hideDinoModal() {
  dinoModal.style.display = 'none';
}

// live image previes goes brrr
modalDinoImageUrl.addEventListener('input', () => {
  const url = modalDinoImageUrl.value.trim();
  if (url) {
    modalDinoImagePreview.src = url;
    modalDinoImagePreview.style.display = 'block';
  } else {
    modalDinoImagePreview.style.display = 'none';
  }
});

closeDinoModal.onclick = hideDinoModal;
cancelDinoModal.onclick = hideDinoModal;
window.onclick = function(event) {
  if (event.target === dinoModal) hideDinoModal();
};

dinoModalForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const dino = {
    name: document.getElementById('modalDinoName').value,
    description: document.getElementById('modalDinoDescription').value,
    size: document.getElementById('modalDinoSize').value,
    weight: document.getElementById('modalDinoWeight').value,
    image_url: document.getElementById('modalDinoImageUrl').value,
    species_id: Number(document.getElementById('modalDinoSpeciesId').value),
    diet_id: Number(document.getElementById('modalDinoDietId').value),
    era_id: Number(document.getElementById('modalDinoEraId').value),
    categories: Array.from(document.getElementById('modalDinoCategories').selectedOptions).map(o => Number(o.value)),
    environments: Array.from(document.getElementById('modalDinoEnvironments').selectedOptions).map(o => Number(o.value))
  };
  const id = document.getElementById('modalDinoId').value;
  const url = id ? `/api/admin/dinos/${id}` : `/api/admin/dinos`;
  const method = id ? 'PUT' : 'POST';
  try {
    const result = await apiRequest(url, method, dino, token);
    if (!result.success) throw new Error(result.error || 'Nie udało się zapisać dinozaura');
    alert('Dinozaur zapisany pomyślnie!');
    hideDinoModal();
    fetchAndDisplayDinoTable();
  } catch (error) {
    alert('Wystąpił błąd przy zapisie.');
  }
});

async function deleteDino(id) {
  const token = localStorage.getItem('token');
  if (!confirm(`Na pewno chcesz usunąć dinozaura o ID ${id}?`)) return;
  try {
    const result = await apiRequest(`/api/admin/dinos/${id}`, 'DELETE', null, token);
    if (!result.success) throw new Error(result.error || 'Błąd usuwania dinozaura');
    alert(`Dinozaur ID ${id} został usunięty.`);
    fetchAndDisplayDinoTable();
  } catch (err) {
    handleError('Błąd podczas usuwania.', err);
  }
}

// --- USERS ---
async function fetchAndDisplayUsersTable() {
  try {
    const token = localStorage.getItem('token');
    const users = (await apiRequest('/api/admin/users', 'GET', null, token)).data;
    dinoTableContainer.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('user-table');
    const headers = ['ID', 'Username', 'Email', 'Role', 'Created At', 'Actions'];
    table.appendChild(createHeaderRow(headers));
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
      `;
      // Add actions cell with Edit button
      const actionsTd = document.createElement('td');
      actionsTd.appendChild(createButton('Edytuj', () => showUserEditForm(user)));
      row.appendChild(actionsTd);
      table.appendChild(row);
    });
    dinoTableContainer.appendChild(table);
  } catch (error) {
    handleError('Nie udało się załadować użytkowników.', error);
  }
}

function showUserEditForm(user) {
  userEditModal.style.display = 'block';
  editUserId.value = user.id;
  editUserRole.value = user.role;
}

closeUserEditModal.onclick = hideUserEditModal;
cancelUserEditModal.onclick = hideUserEditModal;
window.addEventListener('click', function(event) {
  if (event.target === userEditModal) hideUserEditModal();
});
function hideUserEditModal() {
  userEditModal.style.display = 'none';
}

userEditForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const userId = editUserId.value;
  const newRole = editUserRole.value;
  await updateUserRole(userId, newRole);
  hideUserEditModal();
});

async function updateUserRole(userId, newRole) {
  const token = localStorage.getItem('token');
  try {
    const result = await apiRequest(`/api/admin/users/${userId}/status`, 'PUT', { role: newRole }, token);
    if (!result.success) {
      let msg = 'Failed to update user';
      if (typeof result.error === 'string') msg = result.error;
      else if (result.error && result.error.message) msg = result.error.message;
      else if (result.error) msg = JSON.stringify(result.error);
      throw new Error(msg);
    }
    alert('User updated!');
    fetchAndDisplayUsersTable();
  } catch (err) {
    handleError('Error updating user: ' + err.message, err);
  }
}

// --- VOTES ---
async function fetchAndDisplayVotesTable() {
  try {
    const token = localStorage.getItem('token');
    const votes = (await apiRequest('/api/admin/vote', 'GET', null, token)).data;
    dinoTableContainer.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('vote-table');
    const headers = ['Vote ID', 'User ID', 'Dino ID', 'Vote Value', 'Created At'];
    table.appendChild(createHeaderRow(headers));
    votes.forEach(vote => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${vote.id}</td>
        <td>${vote.user_id}</td>
        <td>${vote.dinosaur_id}</td>
        <td>${vote.value}</td>
        <td>${vote.created_at ? new Date(vote.created_at).toLocaleString() : ''}</td>
      `;
      table.appendChild(row);
    });
    dinoTableContainer.appendChild(table);
  } catch (error) {
    handleError('Nie udało się załadować głosów.', error);
  }
}

// --- METADATA ---
async function fetchMetadata() {
  const token = localStorage.getItem('token');
  try {
    const meta = await apiRequest('/api/admin/metadata', 'GET', null, token);
    metadata = meta;
    populateSelect('modalDinoSpeciesId', metadata.species);
    populateSelect('modalDinoDietId', metadata.diets);
    populateSelect('modalDinoEraId', metadata.eras);
    populateSelect('modalDinoCategories', metadata.categories);
    populateSelect('modalDinoEnvironments', metadata.environments);
  } catch (err) {
    handleError('Nie udało się pobrać metadanych', err);
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

// --- HELPERS ---
function setMultiSelect(id, values = []) {
  const select = document.getElementById(id);
  Array.from(select.options).forEach(opt => {
    opt.selected = values.includes(parseInt(opt.value));
  });
}

function createHeaderRow(headers) {
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  return headerRow;
}

function createButton(text, onClick, className = '') {
  const btn = document.createElement('button');
  btn.textContent = text;
  if (className) btn.classList.add(className);
  btn.onclick = onClick;
  return btn;
}

function handleError(msg, error) {
  console.error(msg, error);
  dinoTableContainer.textContent = msg;
}

// --- EVENT LISTENERS ---
async function showDinosWithMetadata() {
  await fetchMetadata();
  await fetchAndDisplayDinoTable();
}

async function showUsersWithMetadata() {
  await fetchMetadata();
  await fetchAndDisplayUsersTable();
}

async function showVotesWithMetadata() {
  await fetchMetadata();
  await fetchAndDisplayVotesTable();
}

document.getElementById('loadDinoTable').addEventListener('click', showDinosWithMetadata);
document.getElementById('loadUsersTable').addEventListener('click', showUsersWithMetadata);
document.getElementById('loadVotesTable').addEventListener('click', showVotesWithMetadata);
showDinosWithMetadata();