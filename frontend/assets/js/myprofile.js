import { apiRequest } from './utils.js';

const token = localStorage.getItem('token');

// --- PROFILE FORM ---
async function loadProfile() {
  const res = await apiRequest('/api/users/me', 'GET', null, token);
  if (res.success && res.data) {
    document.getElementById('profileUsername').value = res.data.username || '';
    document.getElementById('profileEmail').value = res.data.email || '';
    localStorage.setItem('user', JSON.stringify(res.data));
  }
}

document.getElementById('profileForm').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('profileUsername').value;
  const email = document.getElementById('profileEmail').value;
  const password = document.getElementById('profilePassword').value;
  const body = { username, email };
  if (password) body.password = password;
  const res = await apiRequest('/api/users/update', 'PUT', body, token);
  if (res.success) {
    alert('Profile updated!');
    localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), username, email }));
    document.getElementById('profilePassword').value = '';
  } else {
    alert(res.error || 'Update failed');
  }
};

// --- DELETE ACCOUNT ---
document.getElementById('deleteAccountBtn').onclick = async () => {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
  const res = await apiRequest('/api/users/delete', 'DELETE', null, token);
  if (res.success) {
    alert('Account deleted. Logging out...');
    localStorage.clear();
    window.location.href = '/';
  } else {
    alert(res.error || 'Delete failed');
  }
};

// --- FAVORITES ---
async function loadFavorites() {
  const res = await apiRequest('/api/favorites', 'GET', null, token);
  const list = document.getElementById('favoritesList');
  list.innerHTML = '';
  if (res.success && res.data.length) {
    res.data.forEach(dino => {
      const li = document.createElement('li');
      li.textContent = dino.name;
      const btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.onclick = async () => {
        await apiRequest(`/api/favorites/${dino.id}`, 'DELETE', null, token);
        loadFavorites();
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
  } else {
    list.innerHTML = '<li>No favorites yet.</li>';
  }
}

// --- VOTING HISTORY ---
async function loadVotedSessions() {
  const res = await apiRequest('/api/vote/sessions/mine', 'GET', null, token);
  const list = document.getElementById('votedSessionsList');
  list.innerHTML = '';
  if (res.success && res.data.length) {
    res.data.forEach(session => {
      const li = document.createElement('li');
      li.textContent = `${session.title} (${session.description}) — You voted: ${session.dinosaur_name || 'unknown'}`;
      list.appendChild(li);
    });
  } else {
    list.innerHTML = '<li>No voting history yet.</li>';
  }
}

// --- INIT ---
window.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadFavorites();
  loadVotedSessions();
});