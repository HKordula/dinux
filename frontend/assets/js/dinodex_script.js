import { apiRequest } from './utils.js';

const dinoTableContainer = document.getElementById('dinoTableContainer');
const role = localStorage.getItem('role');

function pluralizeLikes(count) {
  return count === 1 ? 'like' : 'likes';
}
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

function showErrorNotification(message) {
  let notif = document.getElementById('dino-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'dino-notification';
    notif.style.position = 'fixed';
    notif.style.left = '20px';
    notif.style.bottom = '20px';
    notif.style.background = '#d32f2f';
    notif.style.color = '#fff';
    notif.style.padding = '16px 24px';
    notif.style.borderRadius = '8px';
    notif.style.fontSize = '1rem';
    notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    notif.style.zIndex = 9999;
    notif.style.transition = 'opacity 0.3s';
    notif.style.opacity = '1';
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.style.opacity = '1';
  setTimeout(() => {
    notif.style.opacity = '0';
  }, 3500);
}

// --- FAVORITES ---
async function getUserFavorites() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  try {
    const res = await apiRequest('/api/favorites', 'GET', null, token);
    if (Array.isArray(res.data)) {
      return res.data.map(d => d.id);
    }
    return [];
  } catch {
    return [];
  }
}

async function addFavorite(dinoId, likesDiv, actionsDiv, dino) {
  const token = localStorage.getItem('token');
  try {
    const res = await apiRequest('/api/favorites', 'POST', { dinoId }, token);
    if (res.success) {
      const dinoRes = await apiRequest(`/api/dinos/${dinoId}`);
      const updatedDino = Array.isArray(dinoRes.data) ? dinoRes.data[0] : dinoRes.data;
      const newLikes = updatedDino && typeof updatedDino.likes === 'number'
        ? updatedDino.likes
        : (dino.likes || 0) + 1;
      const heart = likesDiv.querySelector('.heart-icon');
      heart.textContent = '❤️';
      likesDiv.querySelector('.likes-count').textContent = newLikes;
      if (likesDiv.querySelector('.likes-count').nextSibling)
        likesDiv.querySelector('.likes-count').nextSibling.textContent = ' ' + pluralizeLikes(newLikes);
    } else {
      alert(res.error || 'Failed to add to favorites');
    }
  } catch (e) {
    alert('Failed to add to favorites');
  }
}

async function removeFavorite(dinoId, likesDiv, actionsDiv, dino) {
  const token = localStorage.getItem('token');
  try {
    const res = await apiRequest(`/api/favorites/${dinoId}`, 'DELETE', null, token);
    if (res.success) {
      const dinoRes = await apiRequest(`/api/dinos/${dinoId}`);
      const updatedDino = Array.isArray(dinoRes.data) ? dinoRes.data[0] : dinoRes.data;
      const newLikes = updatedDino && typeof updatedDino.likes === 'number'
        ? updatedDino.likes
        : Math.max((dino.likes || 1) - 1, 0);
      const heart = likesDiv.querySelector('.heart-icon');
      heart.textContent = '🩶';
      likesDiv.querySelector('.likes-count').textContent = newLikes;
      if (likesDiv.querySelector('.likes-count').nextSibling)
        likesDiv.querySelector('.likes-count').nextSibling.textContent = ' ' + pluralizeLikes(newLikes);
    } else {
      alert(res.error || 'Failed to remove from favorites');
    }
  } catch (e) {
    alert('Failed to remove from favorites');
  }
}

// --- TABLE RENDERERS ---
function renderTable(headers, rows, rowRenderer, addBtnText, addBtnHandler, favorites = []) {
  dinoTableContainer.innerHTML = '';
  const table = document.createElement('table');
  table.appendChild(createHeaderRow(headers));
  rows.forEach(rowData => table.appendChild(rowRenderer(rowData, favorites)));
  if (addBtnText && addBtnHandler) {
    const addBtn = createButton(addBtnText, addBtnHandler);
    dinoTableContainer.appendChild(addBtn);
  }
  dinoTableContainer.appendChild(table);
}

function dinoRowRenderer(dino, favorites = []) {
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
  const role = localStorage.getItem('role');
  const isFavorite = favorites.includes(dino.id);
  if (role === 'admin') {
    actionsTd.appendChild(createButton('Edit', () => showDinoModal(dino)));
    actionsTd.appendChild(createButton('Delete', () => deleteDino(dino.id), 'btn-delete'));
    if (isFavorite) {
      actionsTd.appendChild(createButton('Remove Like', () => removeFavorite(dino.id), 'btn-unlike'));
    } else {
      actionsTd.appendChild(createButton('Like', () => addFavorite(dino.id), 'btn-like'));
    }
  } else if (role === 'user') {
    if (isFavorite) {
      actionsTd.appendChild(createButton('Remove Like', () => removeFavorite(dino.id), 'btn-unlike'));
    } else {
      actionsTd.appendChild(createButton('Like', () => addFavorite(dino.id), 'btn-like'));
    }
  }
  row.appendChild(actionsTd);
  return row;
}

async function fetchAndDisplayDinoTable() {
  try {
    const dinos = (await apiRequest('/api/dinos')).data;
    const favorites = await getUserFavorites();
    renderTable(
      ['ID', 'Name', 'Species', 'Description', 'Era', 'Diet', 'Size', 'Weight', 'Environment', 'Category', 'Image', 'Actions'],
      dinos,
      dinoRowRenderer,
      'Dodaj dinozaura',
      showDinoModal,
      favorites
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
    m.title.textContent = dino && dino.id ? 'Edit dinosaur' : 'Add dinosaur';
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

// --- CARD RENDERER ---
function renderDinoCards(dinos, sort = 'default', favorites = []) {
  allDinosCache = dinos; // cache for later use
  currentView = 'grid';
  dinoTableContainer.innerHTML = '';

  let sortedDinos = [...dinos];
  if (sort === 'az') {
    sortedDinos.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'za') {
    sortedDinos.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sort === 'popularity-desc') {
    sortedDinos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sort === 'popularity-asc') {
    sortedDinos.sort((a, b) => (a.likes || 0) - (b.likes || 0));
  }

  const filterWrapper = document.createElement('div');
  filterWrapper.className = 'dino-filter-wrapper';

  const filterSelect = document.createElement('select');
  filterSelect.id = 'dinoSortSelect';
  filterSelect.innerHTML = `
    <option value="default">Default</option>
    <option value="popularity-desc">Most Popular</option>
    <option value="popularity-asc">Least Popular</option>
    <option value="az">Alphabetical A-Z</option>
    <option value="za">Alphabetical Z-A</option>
  `;
  filterSelect.value = sort;

  filterSelect.onchange = async () => {
    const favs = await getUserFavorites();
    renderDinoCards(dinos, filterSelect.value, favs);
  };

  filterWrapper.appendChild(filterSelect);
  dinoTableContainer.appendChild(filterWrapper);

const grid = document.createElement('div');
  grid.className = 'dino-card-grid';
  sortedDinos.forEach(dino => {
    const card = document.createElement('div');
    card.className = 'dino-card';
    const isFavorite = favorites.includes(dino.id);
card.innerHTML = `
  <img src="${dino.image_url || '../assets/images/default-dino.png'}" alt="${dino.name}" class="dino-card-img">
  <div class="dino-card-name">${dino.name}</div>
  <div class="dino-card-likes" id="likes-${dino.id}">
    <span class="heart-icon" style="font-size:1.5em; cursor:pointer;">${isFavorite ? '❤️' : '🩶'}</span>
    <span class="likes-count">${dino.likes || 0}</span> ${pluralizeLikes(dino.likes || 0)}
  </div>
`;
    const likesDiv = card.querySelector(`#likes-${dino.id}`);
    const heart = likesDiv.querySelector('.heart-icon');
    let currentLikes = dino.likes || 0;
    let liked = isFavorite;

const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || (role !== 'admin' && role !== 'user')) {
  heart.onclick = (e) => {
    e.stopPropagation();
    showErrorNotification('You must be logged in as a user to like dinosaurs.');
  };
  heart.style.color = '#aaa';
  heart.style.cursor = 'not-allowed';
} else {
  heart.onclick = async (e) => {
    e.stopPropagation();
    if (liked) {
      await removeFavorite(dino.id, likesDiv, null, {...dino, likes: currentLikes});
      liked = false;
      currentLikes = Math.max(currentLikes - 1, 0);
      heart.textContent = '🩶';
      likesDiv.querySelector('.likes-count').textContent = currentLikes;
      if (likesDiv.querySelector('.likes-count').nextSibling)
        likesDiv.querySelector('.likes-count').nextSibling.textContent = ' ' + pluralizeLikes(currentLikes);
    } else {
      await addFavorite(dino.id, likesDiv, null, {...dino, likes: currentLikes});
      liked = true;
      currentLikes = currentLikes + 1;
      heart.textContent = '❤️';
      likesDiv.querySelector('.likes-count').textContent = currentLikes;
      if (likesDiv.querySelector('.likes-count').nextSibling)
        likesDiv.querySelector('.likes-count').nextSibling.textContent = ' ' + pluralizeLikes(currentLikes);
    }
  };
}

    card.onclick = (e) => {
      if (e.target.classList.contains('heart-icon')) return;
      history.pushState({}, '', `/dinodex/${dino.id}`);
      handleRoute();
    };
    grid.appendChild(card);
  });
  dinoTableContainer.appendChild(grid);
}

async function showDinoDetail(dino) {
  currentView = 'detail';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const favorites = token ? await getUserFavorites() : [];
  const isFavorite = favorites.includes(dino.id);

  dinoTableContainer.innerHTML = `
  <div class="dino-detail">
    <img src="${dino.image_url || '../assets/images/default-dino.png'}" alt="${dino.name}" class="dino-detail-img">
    <h2>${dino.name}</h2>
    <div class="dino-card-likes" id="detail-likes">
      <span class="heart-icon" style="font-size:1.5em; cursor:${token && (role === 'admin' || role === 'user') ? 'pointer' : 'default'}; color:${token && (role === 'admin' || role === 'user') ? '' : '#aaa'};">
        ${isFavorite ? '❤️' : '🩶'}
      </span>
      <span class="likes-count">${dino.likes || 0}</span> ${pluralizeLikes(dino.likes || 0)}
    </div>
      <p><strong>Opis:</strong> ${dino.description}</p>
      <p><strong>Gatunek:</strong> ${dino.species}</p>
      <p><strong>Era:</strong> ${dino.era}</p>
      <p><strong>Dieta:</strong> ${dino.diet}</p>
      <p><strong>Rozmiar:</strong> ${dino.size}</p>
      <p><strong>Waga:</strong> ${dino.weight}</p>
      <button id="backToGridBtn">Back</button>
      <div id="detail-actions"></div>
    </div>
  `;

  document.getElementById('backToGridBtn').onclick = () => {
    history.pushState({}, '', '/dinodex');
    handleRoute();
  };

  const likesDiv = document.getElementById('detail-likes');
  const heart = likesDiv.querySelector('.heart-icon');
  let currentLikes = dino.likes || 0;
  let liked = isFavorite;

  if (token && (role === 'admin' || role === 'user')) {
    heart.onclick = async () => {
      if (liked) {
        await removeFavorite(dino.id, likesDiv, null, {...dino, likes: currentLikes});
        liked = false;
        currentLikes = Math.max(currentLikes - 1, 0);
        heart.textContent = '🩶';
        likesDiv.querySelector('.likes-count').textContent = currentLikes;
      } else {
        await addFavorite(dino.id, likesDiv, null, {...dino, likes: currentLikes});
        liked = true;
        currentLikes = currentLikes + 1;
        heart.textContent = '❤️';
        likesDiv.querySelector('.likes-count').textContent = currentLikes;
      }
    };
  } else {
    heart.onclick = () => {
    showErrorNotification('You must be logged in as a user to like dinosaurs.');
    };
    heart.style.color = '#aaa';
    heart.style.cursor = 'not-allowed';
    heart.title = 'You must be logged in as a user to like dinosaurs.';
  }

  if (role === 'admin') {
    const actionsDiv = document.getElementById('detail-actions');
    const editBtn = createButton('Edit', () => showDinoModal(dino));
    actionsDiv.appendChild(editBtn);
  }
}

// --- MAIN ROUTING ---
async function fetchAndDisplayDinoCards() {
  try {
    const dinos = (await apiRequest('/api/dinos')).data;
    const favorites = await getUserFavorites();
    renderDinoCards(dinos, 'default', favorites);
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
    if (allDinosCache) {
      const dino = allDinosCache.find(d => d.id === id);
      if (dino) {
        showDinoDetail(dino);
        return;
      }
    }
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
    const dinos = (await apiRequest('/api/dinos')).data;
    const favorites = await getUserFavorites();
    renderDinoCards(dinos, 'default', favorites);
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

handleRoute();