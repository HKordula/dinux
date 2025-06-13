const token = localStorage.getItem('token');
const sessionId = window.location.pathname.split('/').pop();

async function fetchVoteSession() {
    const res = await fetch(`/api/vote/${sessionId}`);
    const data = await res.json();
    return data.success ? data.data : null;
}

async function fetchDino(id) {
    const res = await fetch(`/api/dinos/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
}

async function renderVoteSession() {
    const section = document.getElementById('voteSessionSection');
    section.innerHTML = 'Loading...';

    const session = await fetchVoteSession();
    if (!session) {
        section.innerHTML = '<p>Voting session not found.</p>';
        return;
    }

    const [dino1, dino2] = await Promise.all([
        fetchDino(session.choice1_id),
        fetchDino(session.choice2_id)
    ]);

    const votes1 = session.results?.find(r => r.dinosaur_id === dino1.id)?.vote_count || 0;
    const votes2 = session.results?.find(r => r.dinosaur_id === dino2.id)?.vote_count || 0;

    let userVotedFor = null;
    if (token && session.user_vote) {
        userVotedFor = session.user_vote.dinosaur_id;
    }

    section.innerHTML = `
      <h2>${session.title}</h2>
      <p>${session.description}</p>
      <div class="vote-dinos">
        <div class="vote-dino-card">
          <img src="${dino1.image_url || '/assets/images/default-dino.jpg'}" alt="${dino1.name}">
          <h3>${dino1.name}</h3>
          <div class="vote-count">Votes: ${votes1}</div>
          ${token && !userVotedFor ? `<button class="vote-btn" data-dino="${dino1.id}">Vote for ${dino1.name}</button>` : ''}
          ${userVotedFor === dino1.id ? `<div class="voted-label">You voted here!</div>` : ''}
        </div>
        <div class="vote-dino-card">
          <img src="${dino2.image_url || '/assets/images/default-dino.jpg'}" alt="${dino2.name}">
          <h3>${dino2.name}</h3>
          <div class="vote-count">Votes: ${votes2}</div>
          ${token && !userVotedFor ? `<button class="vote-btn" data-dino="${dino2.id}">Vote for ${dino2.name}</button>` : ''}
          ${userVotedFor === dino2.id ? `<div class="voted-label">You voted here!</div>` : ''}
        </div>
      </div>
      ${!token ? `<div class="login-prompt">Log in to vote!</div>` : ''}
    `;

    section.querySelectorAll('.vote-btn').forEach(btn => {
        btn.onclick = async () => {
            const dinoId = btn.getAttribute('data-dino');
            const res = await fetch(`/api/vote/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId, dinosaurId: dinoId })
            });
            const result = await res.json();
            if (result.success) {
                alert('Vote submitted!');
                renderVoteSession();
            } else {
                alert(result.error || 'Vote failed.');
            }
        };
    });
}

window.addEventListener('DOMContentLoaded', renderVoteSession);