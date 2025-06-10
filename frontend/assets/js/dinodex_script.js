
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

let currentView = 'grid'; // 'grid' or 'detail'

let allDinosCache = null;

function renderDinoCards(dinos, sort = 'default') {
  allDinosCache = dinos; // cache for later use
  currentView = 'grid';
  dinoTableContainer.innerHTML = '';

  // Sort dinos based on selected filter
  let sortedDinos = [...dinos];
  if (sort === 'az') {
    sortedDinos.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'za') {
    sortedDinos.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Filter dropdown
const filterWrapper = document.createElement('div');
filterWrapper.className = 'dino-filter-wrapper';

  const filterSelect = document.createElement('select');
filterSelect.id = 'dinoSortSelect';
filterSelect.innerHTML = `
  <option value="default">Default</option>
  <option value="az">Alphabetical A-Z</option>
  <option value="za">Alphabetical Z-A</option>
`;
filterSelect.value = sort;

  filterSelect.onchange = () => {
    renderDinoCards(dinos, filterSelect.value);
  };

  filterWrapper.appendChild(filterSelect);
  dinoTableContainer.appendChild(filterWrapper);

  // Cards grid
  const grid = document.createElement('div');
  grid.className = 'dino-card-grid';
  sortedDinos.forEach(dino => {
    const card = document.createElement('div');
    card.className = 'dino-card';
    card.innerHTML = `
      <img src="${dino.image_url || '../assets/images/default-dino.png'}" alt="${dino.name}" class="dino-card-img">
      <div class="dino-card-name">${dino.name}</div>
    `;
    card.onclick = () => {
      history.pushState({}, '', `/dinodex/${dino.id}`);
      handleRoute();
    };
    grid.appendChild(card);
  });
  dinoTableContainer.appendChild(grid);
}

// Show detail view for a specific dino (subsite)
function showDinoDetail(dino) {
  currentView = 'detail';
  dinoTableContainer.innerHTML = `
    <div class="dino-detail">
      <img src="${dino.image_url || '../assets/images/default-dino.png'}" alt="${dino.name}" class="dino-detail-img">
      <h2>${dino.name}</h2>
      <p><strong>Opis:</strong> ${dino.description}</p>
      <p><strong>Gatunek:</strong> ${dino.species}</p>
      <p><strong>Era:</strong> ${dino.era}</p>
      <p><strong>Dieta:</strong> ${dino.diet}</p>
      <p><strong>Rozmiar:</strong> ${dino.size}</p>
      <p><strong>Waga:</strong> ${dino.weight}</p>
      <button id="backToGridBtn">Powrót</button>
      <button id="editDinoBtn">Edytuj</button>
    </div>
  `;
    document.getElementById('backToGridBtn').onclick = () => {
        history.pushState({}, '', '/dinodex');
        handleRoute();
    };
  document.getElementById('editDinoBtn').onclick = () => showDinoModal(dino);
}

// Replace fetchAndDisplayDinoTable to use cards:
async function fetchAndDisplayDinoCards() {
  try {
    const dinos = (await apiRequest('/api/dinos')).data;
    renderDinoCards(dinos);
  } catch (error) {
    handleError('Nie udało się załadować dinozaurów.', error);
  }
}

async function handleRoute() {
  await fetchMetadata();
  const path = window.location.pathname;
  const match = path.match(/^\/dinodex\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    // Try to use cached data first
    if (allDinosCache) {
      const dino = allDinosCache.find(d => d.id === id);
      if (dino) {
        showDinoDetail(dino);
        return;
      }
    }
    // Fallback: fetch from API
    try {
      const result = await apiRequest(`/api/dinos/${id}`);
      let dino = result && result.data;
      if (Array.isArray(dino)) dino = dino[0];
      if (dino) {
        showDinoDetail(dino);
      } else {
        dinoTableContainer.innerHTML = '<p>Nie znaleziono dinozaura.</p>';
      }
    } catch (e) {
      dinoTableContainer.innerHTML = '<p>Nie znaleziono dinozaura.</p>';
    }
  } else {
    // Grid view
    const dinos = (await apiRequest('/api/dinos')).data;
    renderDinoCards(dinos);
  }
}

// --- EVENT LISTENERS ---
async function showDinosWithMetadata() {
  await fetchMetadata();
  await fetchAndDisplayDinoTable();
}
document.getElementById('loadDinoTable').addEventListener('click', async () => {
  await fetchMetadata();
  await fetchAndDisplayDinoCards();
});
fetchMetadata().then(fetchAndDisplayDinoCards);

window.addEventListener('popstate', handleRoute);

document.getElementById('loadDinoTable').addEventListener('click', () => {
  history.pushState({}, '', '/dinodex');
  handleRoute();
});

// Initial load
handleRoute();