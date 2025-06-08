import { apiRequest } from "./utils.js";

function attachFormHandler({ formId, endpoint, method = 'POST', storeToken = false, successRedirect = '/', successMsg = 'Success! Redirecting...', failMsg = 'Request failed.' }) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
      const result = await apiRequest(endpoint, method, data);
      const msgDiv = form.querySelector('.auth-message');
      if (result.success) {
        if (storeToken && result.data && result.data.token) {
          localStorage.setItem('token', result.data.token);
          if (result.data.user && result.data.user.role) {
            localStorage.setItem('role', result.data.user.role);
          }
        }
        msgDiv.textContent = successMsg;
        msgDiv.style.color = 'green';
        setTimeout(() => window.location.href = successRedirect, 1000);
      } else {
        let errorMsg = failMsg;
        if (typeof result.error === 'string') {
          errorMsg = result.error;
        } else if (result.error && result.error.message) {
          errorMsg = result.error.message;
        }
        msgDiv.textContent = errorMsg;
        msgDiv.style.color = 'red';
      }
    } catch (err) {
      const msgDiv = form.querySelector('.auth-message');
      msgDiv.textContent = 'Network error.';
      msgDiv.style.color = 'red';
    }
  });
}

export function handleLogin(formId = 'loginForm', successRedirect = '/') {
  attachFormHandler({
    formId,
    endpoint: '/api/login',
    storeToken: true,
    successRedirect,
    successMsg: 'Login successful! Redirecting...',
    failMsg: 'Login failed.'
  });
}

export function handleRegistration(formId = 'registerForm', successRedirect = '/') {
  attachFormHandler({
    formId,
    endpoint: '/api/register',
    storeToken: false,
    successRedirect,
    successMsg: 'Registration successful! Redirecting...',
    failMsg: 'Registration failed.'
  });
}