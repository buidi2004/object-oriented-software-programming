const { execSync } = require('child_process');
const fs = require('fs');

const API_BASE = 'http://localhost:5053';

async function registerUser(fullName, email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        password,
        phoneNumber: '0901234567',
        country: 'VN',
        city: 'Hồ Chí Minh'
      })
    });
    const data = await res.json();
    return data.userId;
  } catch (err) {
    console.warn(`User ${email} might already exist:`, err.message);
  }
}

async function seed() {
  console.log('--- 1. REGISTERING SEED USERS ---');
  await registerUser('E2E Admin', 'e2e.admin@test.local', 'Password123!');
  await registerUser('E2E Customer A', 'e2e.customerA@test.local', 'Password123!');
  await registerUser('E2E Customer B', 'e2e.customerB@test.local', 'Password123!');
  await registerUser('E2E NoPerm VPS', 'e2e.noperm.vps@test.local', 'Password123!');
  await registerUser('E2E Customer Empty', 'e2e.customerEmpty@test.local', 'Password123!');

  console.log('--- 2. EXECUTING SEED.SQL ---');
  const path = require('path');
  const sqlFile = path.join(__dirname, 'seed.sql');
  execSync(`cat "${sqlFile}" | docker exec -i cloudservicestore_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Your_Strong_Password_123!' -d CloudServiceStoreDb -C`);

  console.log('=== SEEDING COMPLETED CLEANLY ===');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
