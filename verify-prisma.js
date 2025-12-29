const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking SpinSegment model...');
    if (prisma.spinSegment) {
        console.log('✅ prisma.spinSegment exists');
        const count = await prisma.spinSegment.count();
        console.log(`Count: ${count}`);
    } else {
        console.error('❌ prisma.spinSegment is UNDEFINED');
        console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
