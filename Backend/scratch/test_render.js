const https = require('https');

async function testRender() {
  const loginRes = await fetch('https://complaints-registration-platform-full-nfo0.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev30073@gmail.com', password: '12345' }) // User's credentials from screenshot
  });
  
  console.log('Login status:', loginRes.status);
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie header from Render:', cookies);
}

testRender();
