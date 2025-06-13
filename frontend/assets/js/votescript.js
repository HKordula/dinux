import { apiRequest } from './utils.js';

const token = localStorage.getItem('token');

async function fetchDino(id) {
    const res = await apiRequest(`/api/dinos/${id}`);
    return res.success ? res.data : null;
}

async function fetchRecentVoteSessions() {
    const res = await apiRequest('/api/vote');
    if (!res.success || !Array.isArray(res.data)) return [];
    return res.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 2);
}

async function fetchVoteResults(sessionId) {
    const res = await apiRequest(`/api/vote/${sessionId}`);
    return res.success && res.data && Array.isArray(res.data.results) ? res.data.results : [];
}

async function fetchUserVote(sessionId) {
    if (!token) return null;
    const res = await apiRequest('/api/vote/sessions/mine', 'GET', null, token);
    if (!res.success || !Array.isArray(res.data)) return null;
    const session = res.data.find(s => Number(s.session_id) === Number(sessionId));
    return session ? session.dinosaur_id : null;
}

async function createVoteCard(session) {
    const [dino1, dino2, results] = await Promise.all([
        fetchDino(session.choice1_id),
        fetchDino(session.choice2_id),
        fetchVoteResults(session.id)
    ]);
    const dino1img = dino1?.image_url || '/assets/images/default-dino.jpg';
    const dino2img = dino2?.image_url || '/assets/images/default-dino.jpg';
    const dino1name = dino1?.name || 'Dinosaur 1';
    const dino2name = dino2?.name || 'Dinosaur 2';

    const votes1 = results.find(r => Number(r.dinosaur_id) === Number(dino1.id))?.vote_count || 0;
const votes2 = results.find(r => Number(r.dinosaur_id) === Number(dino2.id))?.vote_count || 0;

    let userVotedFor = null;
    if (token) {
        userVotedFor = await fetchUserVote(session.id);
    }

    const card = document.createElement('div');
    card.className = 'services__card';
    card.style.backgroundImage = `
        linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(17,17,17,0.6) 100%),
        url('${dino1img}')
    `;
    card.innerHTML = `
        <h2>${session.title}</h2>
        <p>${session.description}</p>
        <div class="dino-thumbnails">
            <img src="${dino1img}" alt="${dino1name}">
            <img src="${dino2img}" alt="${dino2name}">
        </div>
        <div class="vote-dino-names">
            <span class="vote-dino-name">${dino1name}</span>
            <span class="vote-dino-name">${dino2name}</span>
        </div>
        <div class="vote-counts">
            <span class="vote-count">Votes: ${votes1}</span>
            <span class="vote-count">Votes: ${votes2}</span>
        </div>
        <div class="vote-btns">
            ${token ? `
                <button class="vote-btn" data-dino="${dino1.id}" ${userVotedFor ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Vote for ${dino1name}</button>
                <button class="vote-btn" data-dino="${dino2.id}" ${userVotedFor ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Vote for ${dino2name}</button>
            ` : ''}
        </div>
        ${userVotedFor === dino1.id ? `<div class="voted-label">You voted for ${dino1name}!</div>` : ''}
        ${userVotedFor === dino2.id ? `<div class="voted-label">You voted for ${dino2name}!</div>` : ''}
        ${!token ? `<div class="login-prompt">Log in to vote!</div>` : ''}
    `;

    if (token && !userVotedFor) {
        card.querySelectorAll('.vote-btn').forEach(btn => {
            btn.onclick = async () => {
                const dinoId = btn.getAttribute('data-dino');
                const res = await apiRequest(
                    `/api/vote/${session.id}`,
                    'POST',
                    { dinosaurId: dinoId },
                    token
                );
                if (res.success) {
                    alert('Vote submitted!');
                    const newCard = await createVoteCard(session);
                    card.replaceWith(newCard);
                } else {
                    alert(res.error || 'Vote failed.');
                }
            };
        });
    }

    return card;
}

async function renderRecentVotes() {
    const container = document.getElementById('recentVotesContainer');
    container.innerHTML = '';
    const sessions = await fetchRecentVoteSessions();
    if (!sessions.length) {
        container.innerHTML = '<p>No voting sessions yet.</p>';
        return;
    }
    for (const session of sessions) {
        const card = await createVoteCard(session);
        container.appendChild(card);
    }
}

window.addEventListener('DOMContentLoaded', renderRecentVotes);