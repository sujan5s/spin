const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create or update the test user
        const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {
                password: hashedPassword // Ensure password is correct even if user exists
            },
            create: {
                email: 'test@example.com',
                name: 'Test User',
                balance: 1000,
                password: hashedPassword,
                tickets: {
                    create: {
                        tokenNumber: '#DEMO-123',
                        price: 50,
                        status: 'active'
                    }
                }
            },
        });
        console.log('Seeded validated user:', user.email);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
