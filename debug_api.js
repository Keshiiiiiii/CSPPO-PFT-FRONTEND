const fetch = globalThis.fetch;

async function run() {
  const adminKey = '5CAMSUCSPPOJJBWFR@2026';
  const baseUrl = 'https://csppopft.onrender.com';
  
  console.log("Signing up/logging in...");
  let r = await fetch(`${baseUrl}/auth/admin/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({
      email: 'bot_debugger@example.com',
      password: 'password123',
      name: 'Bot Debugger',
      role: 'admin'
    })
  });
  
  let data = await r.json();
  let token = data.access_token || data.bearer_token || data.token;
  
  if (!r.ok || !token) {
    r = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ email: 'bot_debugger@example.com', password: 'password123' })
    });
    data = await r.json();
    token = data.access_token || data.bearer_token || data.token;
  }
  
  console.log("Token acquired:", !!token);

  if (!token) return console.log("Auth Failed", data);

  const payload = {
    officer_id: 2,
    minutes: 15,
    seconds: 30,
    test_date: "3-8-2026",
    gender: "female",
    age: 20
  };

  console.log("Trying Walk Test Update with payload:", payload);
  r = await fetch(`${baseUrl}/auth/admin/officer/update/walktest/2`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-admin-key': adminKey
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", r.status);
  console.log("Response:", await r.text());
}

run();
