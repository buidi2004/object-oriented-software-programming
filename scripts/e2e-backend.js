const fs = require('fs');

const API_BASE = 'http://localhost:5053';
const EMAIL = 'testadmin@system.local';
const PASSWORD = 'Password123!';

async function run() {
  console.log('1. Logging in...');
  let token = '';
  try {
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: EMAIL, 
        password: PASSWORD, 
        deviceInfo: 'E2E Script',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js Fetch API'
      })
    });
    const data = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(data));
    token = data.accessToken;
    console.log('Login successful.');
  } catch (err) {
    console.error('Login failed:', err.message);
    return;
  }

  console.log('\n2. Fetching Swagger JSON...');
  let paths = {};
  try {
    const swaggerRes = await fetch(`${API_BASE}/swagger/v1/swagger.json`);
    const data = await swaggerRes.json();
    paths = data.paths;
    console.log(`Found ${Object.keys(paths).length} API paths.`);
  } catch (err) {
    console.error('Failed to fetch swagger JSON:', err.message);
    return;
  }

  const getEndpoints = [];
  for (const [path, methods] of Object.entries(paths)) {
    if (methods.get) {
      getEndpoints.push(path);
    }
  }

  console.log(`\n3. Testing ${getEndpoints.length} GET endpoints...`);
  const errors500 = [];
  let tested = 0;

  for (let path of getEndpoints) {
    let testPath = path.replace(/{.*?}/g, '00000000-0000-0000-0000-000000000000');
    
    try {
      const response = await fetch(`${API_BASE}${testPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      tested++;
      if (response.status >= 500) {
        let text = await response.text();
        console.error(`[${response.status} ERROR] GET ${testPath} -> ${text.substring(0, 300)}`);
        errors500.push({ path: testPath, data: text, status: response.status });
      } else {
        console.log(`[${response.status}] GET ${testPath}`);
      }
    } catch (err) {
      console.error(`[NETWORK ERROR] GET ${testPath} -> ${err.message}`);
    }
  }

  console.log(`\n--- TEST SUMMARY ---`);
  console.log(`Total GET endpoints tested: ${tested}`);
  console.log(`Endpoints returning 500+: ${errors500.length}`);
  if (errors500.length > 0) {
    console.log('List of server errors:');
    errors500.forEach(e => console.log(`- [${e.status}] ${e.path}`));
  }
}

run();
