import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Verify JWT
        const { payload } = await jwtVerify(token.value, JWT_SECRET);
        const userId = Number(payload.userId);

        // Fetch notifications
        // @ts-ignore
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json(notifications, { status: 200 });

    } catch (error) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
