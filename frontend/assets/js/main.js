function includeHTML(id, url, callback) {
    fetch(url)
    .then(res => res.text())
    .then(html => {
        document.getElementById(id).innerHTML = html;
        if (typeof callback === 'function') callback();
    });
}

function getAssetBase() {
    // count how many directories deep
    const depth = window.location.pathname.replace(/\/$/, '').split('/').length - 2;
    return depth > 0 ? '../'.repeat(depth) + 'assets/' : 'assets/';
}

document.addEventListener('DOMContentLoaded', () => {
    const assetBase = getAssetBase();
    includeHTML('navbar-include', assetBase + 'html/navbar.html', setupNavbar);
    includeHTML('footer-include', assetBase + 'html/footer.html');
});

function setupNavbar() {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const menu = document.querySelector('.navbar__menu');
    if (!menu) return;

    // always Home
    menu.innerHTML = `
      <li class="navbar__item">
        <a href="/" class="navbar__links">Home</a>
      </li>
    `;

    //always About
    menu.innerHTML += `
      <li class="navbar__item">
        <a href="/about/how-it-works.html" class="navbar__links">About</a>
      </li>
    `;
    
    if (!token) { // not logged in, show Sign In
      menu.innerHTML += `
        <li class="navbar__btn">
          <a href="/signin/index.html" class="button">Sign In</a>
        </li>
      `;
    } else { // logged in, show My profile or sth #FIXME
      menu.innerHTML += `
        <li class="navbar__item">
          <a href="/test1/test1.html" class="navbar__links">My Profile</a>
        </li>
      `;
      if (role === 'admin') { // hes an admin, show admin stuff
        menu.innerHTML += `
          <li class="navbar__item">
            <a href="/admin/index.html" class="navbar__links">Admin</a>
          </li>
        `;
      }
      // show Logout since hes logged in
      menu.innerHTML += ` 
        <li class="navbar__btn">
          <a href="#" id="logout-btn" class="button">Logout</a>
        </li>
      `;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/index.html';
      });
    }

    const menuToggle = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    if (menuToggle && menuLinks) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('is-active');
            menuLinks.classList.toggle('active');
        });
    }
}