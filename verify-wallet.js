const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'testuser@example.com' } });
        if (user) {
            console.log('User Balance:', user.balance);
            const transactions = await prisma.transaction.findMany({ where: { userId: user.id } });
            console.log('Transactions:', JSON.stringify(transactions, null, 2));
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
