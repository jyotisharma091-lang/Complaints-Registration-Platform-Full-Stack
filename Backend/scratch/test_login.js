const http = require('http');

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jyotisharma091@gmail.com', password: 'Jyoti@1234' })
  });
  
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status);
  console.log('Login body:', loginData);
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie header:', cookies);
  
  if (cookies) {
    const myComplaintsRes = await fetch('http://localhost:3000/api/complaints/my', {
      headers: {
        'Cookie': cookies.split(';')[0]
      }
    });
    console.log('My complaints status:', myComplaintsRes.status);
    const myComplaintsData = await myComplaintsRes.json();
    console.log('My complaints body:', myComplaintsData);
  }
}

test();
