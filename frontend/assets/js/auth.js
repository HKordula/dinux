export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data) options.body = JSON.stringify(data);
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, options);
  return res.json();
}

// generic form handler
export function handleForm(formId, endpoint, {
  method = 'POST',
  onSuccess = () => {},
  onError = () => {},
  successRedirect = null,
  storeToken = false
} = {}) {
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
        }
        msgDiv.textContent = 'Success! Redirecting...';
        msgDiv.style.color = 'green';
        onSuccess(result);
        if (successRedirect) {
          setTimeout(() => window.location.href = successRedirect, 1000);
        }
      } else {
        let errorMsg = 'Request failed.';
        if (typeof result.error === 'string') {
          errorMsg = result.error;
        } else if (result.error && result.error.message) {
          errorMsg = result.error.message;
        }
        msgDiv.textContent = errorMsg;
        msgDiv.style.color = 'red';
        onError(result);
      }
    } catch (err) {
      const msgDiv = form.querySelector('.auth-message');
      msgDiv.textContent = 'Network error.';
      msgDiv.style.color = 'red';
      onError(err);
    }
  });
}
