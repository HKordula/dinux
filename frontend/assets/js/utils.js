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