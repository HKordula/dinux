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
    handleError('Failed to fetch metadata', err);
  }
}

async function fetchAllDinos() {
  const dinos = (await apiRequest('/api/dinos')).data;
  return dinos || [];
}

let currentPage = 1;
const pageSize = 10;
let currentRows = [];
let currentHeaders = [];
let currentRowRenderer = null;
let currentAddBtnText = null;
let currentAddBtnHandler = null;

// --- TABLE RENDERERS ---
function renderTable(headers, rows, rowRenderer, addBtnText, addBtnHandler, tableTitle = '') {
  dinoTableContainer.innerHTML = '';
  currentRows = rows;
  currentHeaders = headers;
  currentRowRenderer = rowRenderer;
  currentAddBtnText = addBtnText;
  currentAddBtnHandler = addBtnHandler;

  const table = document.createElement('table');
  table.className = 'dino-table';
  table.appendChild(createHeaderRow(headers));

  // PAGINATION
  const totalPages = Math.ceil(rows.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = rows.slice(start, end);

  pageRows.forEach(rowData => table.appendChild(rowRenderer(rowData)));

  // --- Header row with add button, title, and pagination ---
  const headerRow = document.createElement('div');
  headerRow.className = 'dino-table-header-row';

  // Add button (left)
  if (addBtnText && addBtnHandler) {
    const addBtn = createButton(addBtnText, addBtnHandler, 'btn-add');
    headerRow.appendChild(addBtn);
  } else {
    headerRow.appendChild(document.createElement('div'));
  }

  // Pagination (right) -- always show arrows
  const pagination = document.createElement('div');
  pagination.className = 'dino-table-pagination-top';

  const prevBtn = createButton('⬅️', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable(currentHeaders, currentRows, currentRowRenderer, currentAddBtnText, currentAddBtnHandler, tableTitle);
    }
  }, 'btn-page');
  prevBtn.disabled = currentPage === 1;

  const nextBtn = createButton('➡️', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable(currentHeaders, currentRows, currentRowRenderer, currentAddBtnText, currentAddBtnHandler, tableTitle);
    }
  }, 'btn-page');
  nextBtn.disabled = currentPage === totalPages;

  pagination.appendChild(prevBtn);
  pagination.appendChild(nextBtn);

  headerRow.appendChild(pagination);

  // Insert header row above the table
  dinoTableContainer.appendChild(headerRow);
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
  actionsTd.appendChild(createButton('Edit', () => showDinoModal(dino), 'btn-edit'));
  actionsTd.appendChild(createButton('Delete', () => deleteDino(dino.id), 'btn-delete'));
  row.appendChild(actionsTd);
  return row;
}

async function fetchAndDisplayDinoTable() {
  try {
    currentPage = 1;
    const dinos = (await apiRequest('/api/dinos')).data;
    renderTable(
      ['ID', 'Name', 'Species', 'Description', 'Era', 'Diet', 'Size', 'Weight', 'Environment', 'Category', 'Image', 'Actions'],
      dinos,
      dinoRowRenderer,
      'Add dinosaur',
      showDinoModal,
    );
  } catch (error) {
    handleError('Failed to load dinosaurs.', error);
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
    <td>${user.status}</td>
    <td>${user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
  `;
  const actionsTd = document.createElement('td');
  actionsTd.appendChild(createButton('Edit', () => showUserEditForm(user), 'btn-edit'));
  actionsTd.appendChild(createButton('Delete', () => deleteUser(user.id, user.username), 'btn-delete'));
  row.appendChild(actionsTd);
  return row;
}

async function deleteUser(userId, username) {
  const token = localStorage.getItem('token');
  if (!confirm(`Are you sure you want to delete user "${username}" (ID: ${userId})?`)) return;
  try {
    const result = await apiRequest(`/api/admin/users/${userId}`, 'DELETE', null, token);
    if (!result.success) throw new Error(result.error || 'Error deleting user');
    alert(`User "${username}" (ID: ${userId}) has been deleted.`);
    fetchAndDisplayUsersTable();
  } catch (err) {
    handleError('Error while deleting user.', err);
  }
}

async function fetchAndDisplayUsersTable() {
  try {
    const token = localStorage.getItem('token');
    const users = (await apiRequest('/api/admin/users', 'GET', null, token)).data;
    renderTable(
      ['ID', 'Username', 'Email', 'Role', 'Status', 'Created At', 'Actions'],
      users,
      userRowRenderer,
      'Add user',           // <-- Button text
      showUserAddModal,     // <-- Button handler (implement this function to show your add user modal)
    );
  } catch (error) {
    handleError('Failed to load users.', error);
  }
}

function showUserAddModal() {
  const m = modals.user;
  m.modal.style.display = 'block';
  m.form.reset();
  m.id.value = '';
  m.role.value = 'user';
  // Set status select value to default (e.g. 'activated')
  const statusSelect = document.getElementById('editUserStatus');
  if (statusSelect) {
    statusSelect.value = 'activated';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username'); // or get from your auth system
  if (username) {
    document.getElementById('admin-username').textContent = username;
  }
});

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
  actionsTd.appendChild(createButton('Edit', () => showVoteSessionModal(session), 'btn-edit'));
  actionsTd.appendChild(createButton('Delete', () => deleteVoteSession(session.id), 'btn-delete'));
  actionsTd.appendChild(createButton('Results', () => showVoteResultsModal(session.id), 'btn-results'));
  row.appendChild(actionsTd);
  return row;
}

async function fetchAndDisplayVoteSessionsTable() {
  try {
    const token = localStorage.getItem('token');
    const sessions = (await apiRequest('/api/admin/vote', 'GET', null, token)).data;
    renderTable(
      ['ID', 'Title', 'Description', 'Dinosaur 1', 'Dinosaur 2', 'Actions'],
      sessions,
      voteSessionRowRenderer,
      'Add voting session',
      showVoteSessionModal,
    );
  } catch (error) {
    handleError('Failed to load voting sessions.', error);
  }
}

// --- MODAL LOGIC (dino) ---
function showDinoModal(dino = null) {
  fetchMetadata().then(() => {
    const m = modals.dino;
    m.modal.style.display = 'block';
    m.title.textContent = dino && dino.id ? 'Edit dinosaur' : 'Add dinosaur';
    m.form.reset();
    m.id.value = dino?.id || '';
    m.name.value = dino?.name || '';
    m.description.value = dino?.description || '';
    m.size.value = dino?.size || '';
    m.weight.value = dino?.weight || '';
    m.imageUrl.value = dino?.image_url || '';
    if (dino) {
      m.species.value = dino.species_id;
      m.diet.value = dino.diet_id;
      m.era.value = dino.era_id;
      setMultiSelect('modalDinoCategories', Array.isArray(dino.categories) ? dino.categories.map(c => typeof c === 'object' ? c.id : Number(c)) : []);
      setMultiSelect('modalDinoEnvironments', Array.isArray(dino.environments) ? dino.environments.map(e => typeof e === 'object' ? e.id : Number(e)) : []);
    }
  });
}
function hideDinoModal() {
   modals.dino.modal.style.display = 'none'; 
  }

modals.dino.close.onclick = hideDinoModal;
modals.dino.cancel.onclick = hideDinoModal;


function hideUserEditModal() {
  modals.user.modal.style.display = 'none';
}

modals.user.close.onclick = hideUserEditModal;
modals.user.cancel.onclick = hideUserEditModal;

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
    if (!result.success) throw new Error(result.error || 'Failed to save dinosaur');
    alert('Dinosaur saved successfully!');
    hideDinoModal();
    fetchAndDisplayDinoTable();
  } catch (error) {
    alert('Error saving dinosaur.');
  }
});
async function deleteDino(id) {
  const token = localStorage.getItem('token');
  if (!confirm(`Are you sure you want to delete dinosaur with ID ${id}?`)) return;
  try {
    const result = await apiRequest(`/api/admin/dinos/${id}`, 'DELETE', null, token);
    if (!result.success) throw new Error(result.error || 'Error deleting dinosaur');
    alert(`Dinosaur ID ${id} has been deleted.`);
    fetchAndDisplayDinoTable();
  } catch (err) {
    handleError('Error while deleting.', err);
  }
}

// --- MODAL LOGIC (user) ---
// ...existing code...
function showUserEditForm(user) {
  const m = modals.user;
  m.modal.style.display = 'block';
  m.id.value = user.id;
  m.role.value = user.role;
  // Set status select value
  const statusSelect = document.getElementById('editUserStatus');
  if (statusSelect) {
    statusSelect.value = user.status || 'activated';
  }
}
// ...existing code...
modals.user.form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const userId = modals.user.id.value;
  const newRole = modals.user.role.value;
  const newStatus = document.getElementById('editUserStatus').value;
  await updateUserRoleAndStatus(userId, newRole, newStatus);
  hideUserEditModal();
});
// ...existing code...

async function updateUserRoleAndStatus(userId, newRole, newStatus) {
  const token = localStorage.getItem('token');
  try {
    const result = await apiRequest(`/api/admin/users/${userId}/status`, 'PUT', { role: newRole, status: newStatus }, token);
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
  m.title.textContent = session ? 'Edit voting session' : 'Add voting session';
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
    if (!result.success) throw new Error(result.error || 'Failed to save session');
    alert('Voting session saved!');
    hideVoteSessionModal();
    fetchAndDisplayVoteSessionsTable();
  } catch (error) {
    alert('Error saving voting session.');
  }
});
async function deleteVoteSession(id) {
  const token = localStorage.getItem('token');
  if (!confirm(`Are you sure you want to delete voting session with ID ${id}?`)) return;
  try {
    const result = await apiRequest(`/api/admin/vote/${id}`, 'DELETE', null, token);
    if (!result.success) throw new Error(result.error || 'Error deleting session');
    alert(`Voting session ID ${id} has been deleted.`);
    fetchAndDisplayVoteSessionsTable();
  } catch (err) {
    handleError('Error while deleting session.', err);
  }
}

// --- MODAL LOGIC (vote results) ---
function showVoteResultsModal(sessionId) {
  const m = modals.voteResults;
  m.modal.style.display = 'block';
  m.content.innerHTML = 'Loading...';
  fetchVoteResults(sessionId);
}
function hideVoteResultsModal() { modals.voteResults.modal.style.display = 'none'; }
modals.voteResults.close.onclick = hideVoteResultsModal;
async function fetchVoteResults(sessionId) {
  try {
    const token = localStorage.getItem('token');
    const res = await apiRequest(`/api/admin/vote/${sessionId}/results`, 'GET', null, token);
    const results = res.data.results || [];
    if (!results.length) {
      modals.voteResults.content.innerHTML = '<p>No votes in this session.</p>';
      return;
    }
    let html = '<table><tr><th>Dinosaur</th><th>Vote count</th></tr>';
    results.forEach(r => {
      html += `<tr><td>${r.name}</td><td>${r.vote_count}</td></tr>`;
    });
    html += '</table>';
    modals.voteResults.content.innerHTML = html;
  } catch (err) {
    modals.voteResults.content.innerHTML = 'Error loading results.';
  }
}

function hideAllModals() {
  Object.values(modals).forEach(m => {
    if (m.modal) m.modal.style.display = 'none';
  });
}

// --- EVENT LISTENERS ---
async function showDinosWithMetadata() {
  hideAllModals();
  currentPage = 1;
  await fetchMetadata();
  await fetchAndDisplayDinoTable();
}
async function showUsersWithMetadata() {
  hideAllModals();
  currentPage = 1;
  await fetchMetadata();
  await fetchAndDisplayUsersTable();
}
async function showVotesWithMetadata() {
  hideAllModals();
  currentPage = 1;
  await fetchMetadata();
  await fetchAndDisplayVoteSessionsTable();
}

window.addEventListener('click', function(event) {
  Object.values(modals).forEach(m => {
    if (m.modal && event.target === m.modal) {
      m.modal.style.display = 'none';
    }
  });
});

document.getElementById('loadDinoTable').addEventListener('click', showDinosWithMetadata);
document.getElementById('loadUsersTable').addEventListener('click', showUsersWithMetadata);
document.getElementById('loadVotesTable').addEventListener('click', showVotesWithMetadata);
showDinosWithMetadata();