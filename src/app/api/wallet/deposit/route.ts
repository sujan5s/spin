import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");

export async function POST(request: Request) {
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

        const { amount } = await request.json();

        console.log("Deposit request received for user:", userId, "Amount:", amount);

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid amount" },
                { status: 400 }
            );
        }

        // Update user balance and create transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: { increment: amount },
                },
            });
            console.log("User balance updated:", user.balance);

            await tx.transaction.create({
                data: {
                    userId,
                    type: "deposit",
                    amount,
                },
            });
            console.log("Transaction created");

            return user;
        });

        return NextResponse.json({ balance: result.balance }, { status: 200 });
    } catch (error) {
        console.error("Deposit error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
