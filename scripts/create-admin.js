const { execSync } = require('child_process');

async function createAdmin() {
    const API_BASE = 'http://localhost:5053';
    
    // Register
    try {
        console.log("Registering temp user...");
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fullName: 'Test Admin', 
                email: 'testadmin@system.local', 
                password: 'Password123!',
                phoneNumber: '0123456789'
            })
        });
        if (!res.ok) {
            console.log("Register failed:", await res.text());
        } else {
            console.log("Registered.");
        }
    } catch(e) {
        console.error(e);
    }
    
    // Make Admin in DB using sqlcmd inside docker container
    console.log("Promoting to Admin via DB...");
    try {
        const sql = `
        UPDATE AppUsers 
        SET RoleId = (SELECT Id FROM Roles WHERE Name = 'Admin') 
        WHERE Email = 'testadmin@system.local';
        `;
        execSync(`docker exec cloudservicestore-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Your_password123' -d CloudServiceStoreDb -Q "${sql}"`);
        console.log("Promoted.");
    } catch(e) {
        console.error("DB Update failed:", e.message);
    }
}

createAdmin();
