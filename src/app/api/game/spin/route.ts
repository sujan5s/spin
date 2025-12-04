import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");

const SEGMENTS = [
    { label: "2x", value: 2 },
    { label: "0x", value: 0 },
    { label: "1.5x", value: 1.5 },
    { label: "0x", value: 0 },
    { label: "3x", value: 3 },
    { label: "0x", value: 0 },
    { label: "1.2x", value: 1.2 },
    { label: "0.5x", value: 0.5 },
];

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

        const { betAmount } = await request.json();

        if (!betAmount || betAmount <= 0) {
            return NextResponse.json(
                { error: "Invalid bet amount" },
                { status: 400 }
            );
        }

        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get user and check balance
            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error("User not found");
            }

            if (user.balance < betAmount) {
                throw new Error("Insufficient balance");
            }

            // 2. Determine outcome
            // Simple random selection for now
            const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
            const segment = SEGMENTS[segmentIndex];
            const multiplier = segment.value;
            const winAmount = betAmount * multiplier;
            const profit = winAmount - betAmount; // Net change

            // 3. Update balance
            // Deduct bet, add winnings (or just add profit)
            // balance = balance - bet + win
            const newBalance = user.balance - betAmount + winAmount;

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: newBalance,
                },
            });

            // 4. Create transaction record
            // We can record the bet and win separately or as one "game" transaction
            // Let's record it as one "game_spin" transaction with the net amount
            // Or better: record the "bet" (negative) and "win" (positive) if won?
            // To keep it simple and consistent with the user request "spin amount update",
            // let's record the net result.
            // If winAmount > 0, it's a win. If 0, it's a loss.

            await tx.transaction.create({
                data: {
                    userId,
                    type: winAmount > 0 ? "game_win" : "game_loss",
                    amount: profit, // This will be negative if lost, positive if won
                },
            });

            return {
                balance: updatedUser.balance,
                segmentIndex,
                multiplier,
                winAmount,
            };
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error("Spin error:", error);
        if (error.message === "Insufficient balance") {
            return NextResponse.json(
                { error: "Insufficient balance" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
