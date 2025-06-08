import { apiRequest } from './utils.js';

const dinoTableContainer = document.getElementById('dinoTableContainer');

// --- MODAL ELEMENTS ---
const modals = {
  dino: {
    modal: document.getElementById('dinoModal'),
    close: document.getElementById('closeDinoModal'),
    form: document.getElementById('dinoModalForm'),
    cancel: document.getElementById('cancelDinoModal'),
    title: document.getElementById('modalFormTitle'),
    imageUrl: document.getElementById('modalDinoImageUrl'),
    imagePreview: document.getElementById('modalDinoImagePreview'),
    id: document.getElementById('modalDinoId'),
    name: document.getElementById('modalDinoName'),
    description: document.getElementById('modalDinoDescription'),
    size: document.getElementById('modalDinoSize'),
    weight: document.getElementById('modalDinoWeight'),
    species: document.getElementById('modalDinoSpeciesId'),
    diet: document.getElementById('modalDinoDietId'),
    era: document.getElementById('modalDinoEraId'),
    categories: document.getElementById('modalDinoCategories'),
    environments: document.getElementById('modalDinoEnvironments'),
  },
  user: {
    modal: document.getElementById('userEditModal'),
    close: document.getElementById('closeUserEditModal'),
    form: document.getElementById('userEditForm'),
    cancel: document.getElementById('cancelUserEditModal'),
    id: document.getElementById('editUserId'),
    role: document.getElementById('editUserRole'),
  },
  voteSession: {
    modal: document.getElementById('voteSessionModal'),
    close: document.getElementById('closeVoteSessionModal'),
    form: document.getElementById('voteSessionForm'),
    cancel: document.getElementById('cancelVoteSessionModal'),
    title: document.getElementById('voteSessionModalTitle'),
    id: document.getElementById('voteSessionId'),
    name: document.getElementById('voteSessionTitle'),
    description: document.getElementById('voteSessionDescription'),
    choice1: document.getElementById('voteSessionChoice1'),
    choice2: document.getElementById('voteSessionChoice2'),
  },
  voteResults: {
    modal: document.getElementById('voteResultsModal'),
    close: document.getElementById('closeVoteResultsModal'),
    content: document.getElementById('voteResultsContent'),
  }
};

let metadata = {};

// --- GENERIC HELPERS ---
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

function populateSelect(idOrElem, options) {
  const select = typeof idOrElem === 'string' ? document.getElementById(idOrElem) : idOrElem;
  select.innerHTML = '';
  if (!Array.isArray(options)) return;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.id;
    option.textContent = opt.name;
    select.appendChild(option);
  });
}

function setMultiSelect(id, values = []) {
  const select = document.getElementById(id);
  Array.from(select.options).forEach(opt => {
    opt.selected = values.includes(parseInt(opt.value));
  });
}

function handleError(msg, error) {
  console.error(msg, error);
  dinoTableContainer.textContent = msg;
}

// --- METADATA ---
async function fetchMetadata() {
  const token = localStorage.getItem('token');
  try {
    const meta = await apiRequest('/api/admin/metadata', 'GET', null, token);
    metadata = meta;
    populateSelect('modalDinoSpeciesId', metadata.species || []);
    populateSelect('modalDinoDietId', metadata.diets || []);
    populateSelect('modalDinoEraId', metadata.eras || []);
    populateSelect('modalDinoCategories', metadata.categories || []);
    populateSelect('modalDinoEnvironments', metadata.environments || []);
  } catch (err) {
    handleError('Nie udało się pobrać metadanych', err);
  }
}

async function fetchAllDinos() {
  const dinos = (await apiRequest('/api/dinos')).data;
  return dinos || [];
}

// --- TABLE RENDERERS ---
function renderTable(headers, rows, rowRenderer, addBtnText, addBtnHandler) {
  dinoTableContainer.innerHTML = '';
  const table = document.createElement('table');
  table.appendChild(createHeaderRow(headers));
  rows.forEach(rowData => table.appendChild(rowRenderer(rowData)));
  if (addBtnText && addBtnHandler) {
    const addBtn = createButton(addBtnText, addBtnHandler);
    dinoTableContainer.appendChild(addBtn);
  }
  dinoTableContainer.appendChild(table);
}

// --- DINOS ---
function dinoRowRenderer(dino) {
  const row = document.createElement('tr');
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
  return row;
}

async function fetchAndDisplayDinoTable() {
  try {
    const dinos = (await apiRequest('/api/dinos')).data;
    renderTable(
      ['ID', 'Name', 'Species', 'Description', 'Era', 'Diet', 'Size', 'Weight', 'Environment', 'Category', 'Image', 'Actions'],
      dinos,
      dinoRowRenderer,
      'Dodaj dinozaura',
      showDinoModal
    );
  } catch (error) {
    handleError('Nie udało się załadować dinozaurów.', error);
  }
}

// --- USERS ---
function userRowRenderer(user) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${user.id}</td>
    <td>${user.username}</td>
    <td>${user.email}</td>
    <td>${user.role}</td>
    <td>${user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
  `;
  const actionsTd = document.createElement('td');
  actionsTd.appendChild(createButton('Edytuj', () => showUserEditForm(user)));
  row.appendChild(actionsTd);
  return row;
}

async function fetchAndDisplayUsersTable() {
  try {
    const token = localStorage.getItem('token');
    const users = (await apiRequest('/api/admin/users', 'GET', null, token)).data;
    renderTable(
      ['ID', 'Username', 'Email', 'Role', 'Created At', 'Actions'],
      users,
      userRowRenderer
    );
  } catch (error) {
    handleError('Nie udało się załadować użytkowników.', error);
  }
}

// --- VOTE SESSIONS ---
function voteSessionRowRenderer(session) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${session.id}</td>
    <td>${session.title}</td>
    <td>${session.description}</td>
    <td>${session.choice1_name || session.choice1_id}</td>
    <td>${session.choice2_name || session.choice2_id}</td>
  `;
  const actionsTd = document.createElement('td');
  actionsTd.appendChild(createButton('Edytuj', () => showVoteSessionModal(session)));
  actionsTd.appendChild(createButton('Usuń', () => deleteVoteSession(session.id), 'btn-delete'));
  actionsTd.appendChild(createButton('Wyniki', () => showVoteResultsModal(session.id)));
  row.appendChild(actionsTd);
  return row;
}

async function fetchAndDisplayVoteSessionsTable() {
  try {
    const token = localStorage.getItem('token');
    const sessions = (await apiRequest('/api/admin/vote', 'GET', null, token)).data;
    renderTable(
      ['ID', 'Tytuł', 'Opis', 'Dinozaur 1', 'Dinozaur 2', 'Akcje'],
      sessions,
      voteSessionRowRenderer,
      'Dodaj sesję głosowania',
      showVoteSessionModal
    );
  } catch (error) {
    handleError('Nie udało się załadować sesji głosowania.', error);
  }
}

// --- MODAL LOGIC (dino) ---
function showDinoModal(dino = null) {
  fetchMetadata().then(() => {
    const m = modals.dino;
    m.modal.style.display = 'block';
    m.title.textContent = dino ? 'Edytuj dinozaura' : 'Dodaj dinozaura';
    m.form.reset();
    m.id.value = dino?.id || '';
    m.name.value = dino?.name || '';
    m.description.value = dino?.description || '';
    m.size.value = dino?.size || '';
    m.weight.value = dino?.weight || '';
    m.imageUrl.value = dino?.image_url || '';
    m.imagePreview.style.display = dino?.image_url ? 'block' : 'none';
    m.imagePreview.src = dino?.image_url || '';
    if (dino) {
      m.species.value = dino.species_id;
      m.diet.value = dino.diet_id;
      m.era.value = dino.era_id;
      setMultiSelect('modalDinoCategories', Array.isArray(dino.categories) ? dino.categories.map(c => typeof c === 'object' ? c.id : Number(c)) : []);
      setMultiSelect('modalDinoEnvironments', Array.isArray(dino.environments) ? dino.environments.map(e => typeof e === 'object' ? e.id : Number(e)) : []);
    }
  });
}
function hideDinoModal() { modals.dino.modal.style.display = 'none'; }
modals.dino.close.onclick = hideDinoModal;
modals.dino.cancel.onclick = hideDinoModal;
window.onclick = function(event) { if (event.target === modals.dino.modal) hideDinoModal(); };
modals.dino.imageUrl.addEventListener('input', () => {
  const url = modals.dino.imageUrl.value.trim();
  if (url) {
    modals.dino.imagePreview.src = url;
    modals.dino.imagePreview.style.display = 'block';
  } else {
    modals.dino.imagePreview.style.display = 'none';
  }
});
modals.dino.form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const dino = {
    name: modals.dino.name.value,
    description: modals.dino.description.value,
    size: modals.dino.size.value,
    weight: modals.dino.weight.value,
    image_url: modals.dino.imageUrl.value,
    species_id: Number(modals.dino.species.value),
    diet_id: Number(modals.dino.diet.value),
    era_id: Number(modals.dino.era.value),
    categories: Array.from(modals.dino.categories.selectedOptions).map(o => Number(o.value)),
    environments: Array.from(modals.dino.environments.selectedOptions).map(o => Number(o.value))
  };
  const id = modals.dino.id.value;
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

// --- MODAL LOGIC (user) ---
function showUserEditForm(user) {
  const m = modals.user;
  m.modal.style.display = 'block';
  m.id.value = user.id;
  m.role.value = user.role;
}
function hideUserEditModal() { modals.user.modal.style.display = 'none'; }
modals.user.close.onclick = hideUserEditModal;
modals.user.cancel.onclick = hideUserEditModal;
window.addEventListener('click', function(event) {
  if (event.target === modals.user.modal) hideUserEditModal();
});
modals.user.form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const userId = modals.user.id.value;
  const newRole = modals.user.role.value;
  await updateUserRole(userId, newRole);
  hideUserEditModal();
});
async function updateUserRole(userId, newRole) {
  const token = localStorage.getItem('token');
  try {
    const result = await apiRequest(`/api/admin/users/${userId}/status`, 'PUT', { role: newRole }, token);
    if (!result.success) throw new Error(result.error || 'Failed to update user');
    alert('User updated!');
    fetchAndDisplayUsersTable();
  } catch (err) {
    handleError('Error updating user: ' + err.message, err);
  }
}

// --- MODAL LOGIC (vote session) ---
function showVoteSessionModal(session = null) {
  const m = modals.voteSession;
  m.modal.style.display = 'block';
  m.title.textContent = session ? 'Edytuj sesję głosowania' : 'Dodaj sesję głosowania';
  m.form.reset();
  m.id.value = session?.id || '';
  m.name.value = session?.title || '';
  m.description.value = session?.description || '';
  fetchAllDinos().then(dinos => {
    populateSelect(m.choice1, dinos);
    populateSelect(m.choice2, dinos);
    setTimeout(() => {
      m.choice1.value = session?.choice1_id || '';
      m.choice2.value = session?.choice2_id || '';
    }, 0);
  });
}
function hideVoteSessionModal() { modals.voteSession.modal.style.display = 'none'; }
modals.voteSession.close.onclick = hideVoteSessionModal;
modals.voteSession.cancel.onclick = hideVoteSessionModal;
window.addEventListener('click', function(event) {
  if (event.target === modals.voteSession.modal) hideVoteSessionModal();
});
modals.voteSession.form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const session = {
    title: modals.voteSession.name.value,
    description: modals.voteSession.description.value,
    choice1_id: Number(modals.voteSession.choice1.value),
    choice2_id: Number(modals.voteSession.choice2.value)
  };
  const id = modals.voteSession.id.value;
  const url = id ? `/api/admin/vote/${id}` : `/api/admin/vote`;
  const method = id ? 'PUT' : 'POST';
  try {
    const result = await apiRequest(url, method, session, token);
    if (!result.success) throw new Error(result.error || 'Nie udało się zapisać sesji');
    alert('Sesja głosowania zapisana!');
    hideVoteSessionModal();
    fetchAndDisplayVoteSessionsTable();
  } catch (error) {
    alert('Wystąpił błąd przy zapisie sesji.');
  }
});
async function deleteVoteSession(id) {
  const token = localStorage.getItem('token');
  if (!confirm(`Na pewno chcesz usunąć sesję głosowania o ID ${id}?`)) return;
  try {
    const result = await apiRequest(`/api/admin/vote/${id}`, 'DELETE', null, token);
    if (!result.success) throw new Error(result.error || 'Błąd usuwania sesji');
    alert(`Sesja głosowania ID ${id} została usunięta.`);
    fetchAndDisplayVoteSessionsTable();
  } catch (err) {
    handleError('Błąd podczas usuwania sesji.', err);
  }
}

// --- MODAL LOGIC (vote results) ---
function showVoteResultsModal(sessionId) {
  const m = modals.voteResults;
  m.modal.style.display = 'block';
  m.content.innerHTML = 'Ładowanie...';
  fetchVoteResults(sessionId);
}
function hideVoteResultsModal() { modals.voteResults.modal.style.display = 'none'; }
modals.voteResults.close.onclick = hideVoteResultsModal;
window.addEventListener('click', function(event) {
  if (event.target === modals.voteResults.modal) hideVoteResultsModal();
});
async function fetchVoteResults(sessionId) {
  try {
    const token = localStorage.getItem('token');
    const res = await apiRequest(`/api/admin/vote/${sessionId}/results`, 'GET', null, token);
    const results = res.data.results || [];
    if (!results.length) {
      modals.voteResults.content.innerHTML = '<p>Brak głosów w tej sesji.</p>';
      return;
    }
    let html = '<table><tr><th>Dinozaur</th><th>Liczba głosów</th></tr>';
    results.forEach(r => {
      html += `<tr><td>${r.name}</td><td>${r.vote_count}</td></tr>`;
    });
    html += '</table>';
    modals.voteResults.content.innerHTML = html;
  } catch (err) {
    modals.voteResults.content.innerHTML = 'Błąd ładowania wyników.';
  }
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
  await fetchAndDisplayVoteSessionsTable();
}
document.getElementById('loadDinoTable').addEventListener('click', showDinosWithMetadata);
document.getElementById('loadUsersTable').addEventListener('click', showUsersWithMetadata);
document.getElementById('loadVotesTable').addEventListener('click', showVotesWithMetadata);
showDinosWithMetadata();