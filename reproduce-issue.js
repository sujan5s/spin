async function testDeposit() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'testuser@example.com', password: 'password123' })
        });

        if (!loginRes.ok) {
            console.error("Login failed:", await loginRes.text());
            return;
        }

        const cookie = loginRes.headers.get('set-cookie');
        console.log("Login successful. Cookie:", cookie);

        // 2. Deposit
        console.log("Depositing $100...");
        const depositRes = await fetch('http://localhost:3000/api/wallet/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({ amount: 100 })
        });

        console.log("Deposit response status:", depositRes.status);
        const text = await depositRes.text();
        console.log("Deposit response text:", text);

        if (!depositRes.ok) {
            console.error("Deposit failed");
            return;
        }

        const data = JSON.parse(text);
        console.log("Deposit successful. New Balance:", data.balance);

    } catch (e) {
        console.error("Error:", e);
    }
}

testDeposit();
