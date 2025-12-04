async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/test');
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testApi();
