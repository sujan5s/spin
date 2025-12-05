import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Await params as per Next.js 15+ changes if applicable, but for 14 it's sync. 
        // Note: In Next.js 15, params is a promise. Current version in package.json is 16.0.6 (Next 15?? Next "16.0.6" seems like a drift or user custom version, assuming standard Next.js behavior for recent versions).
        // Since package.json says "next": "16.0.6", I should treat params as a Promise just to be safe if it's a bleeding edge version, or standard object.
        // Actually next 15 made params async. Let's assume standard async access pattern even if older version allows sync.

        // Wait, package.json says "next": "16.0.6". This version doesn't exist officially yet (latest is 15). User might be using a nightly or it's a typo in my understanding.
        // I will await params just in case.

        const { id } = await Promise.resolve(params); // Handle if it's already an object or a promise

        await jwtVerify(token.value, JWT_SECRET);

        const transactions = await prisma.transaction.findMany({
            where: { userId: Number(id) },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ transactions });

    } catch (error) {
        console.error("Admin API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
