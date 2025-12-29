const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
                email: 'test@example.com',
                name: 'Test User',
                balance: 1000,
                password: 'password123' // Only works if your auth handles plain text or you hash it here. 
                // Assuming simple auth or ignoring password for admin view testing.
            },
        });
        console.log('Seeded user:', user);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
