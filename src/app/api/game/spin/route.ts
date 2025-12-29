import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SEGMENTS } from "@/lib/game-config";

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

            // 2. Determine outcome using Weighted Random Logic from Database

            // @ts-ignore
            let segments = await tx.spinSegment.findMany({
                where: { isVisible: true },
                orderBy: { id: 'asc' }
            });

            // Fallback to config if no segments in DB (safety check)
            if (segments.length === 0) {
                // Potentially seed here if transaction limits allow, or just throw error/use static
                // For now, let's assume if it's empty we use static but mapped to same structure
                segments = SEGMENTS.map(s => ({ ...s, probability: 10 }));
            }

            // Calculate Total Weight
            const totalWeight = segments.reduce((sum: number, segment: any) => sum + segment.probability, 0);

            // Random value between 0 and totalWeight
            let random = Math.random() * totalWeight;

            let selectedSegment = segments[0];
            let segmentIndex = 0;

            for (let i = 0; i < segments.length; i++) {
                random -= segments[i].probability;
                if (random <= 0) {
                    selectedSegment = segments[i];
                    segmentIndex = i;
                    break;
                }
            }

            const multiplier = selectedSegment.value;
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

            // @ts-ignore
            await tx.transaction.create({
                data: {
                    userId,
                    type: winAmount > 0 ? "game_win" : "game_loss",
                    amount: profit, // This will be negative if lost, positive if won
                },
            });

            // Create Notification
            const notificationTitle = winAmount > 0 ? "Big Win!" : "Better Luck Next Time";
            const notificationMessage = winAmount > 0
                ? `You won $${winAmount.toFixed(2)} with a ${multiplier}x multiplier!`
                : `You lost $${betAmount.toFixed(2)}. Try again!`;
            const notificationType = winAmount > 0 ? "success" : "info";

            // @ts-ignore
            await tx.notification.create({
                data: {
                    userId,
                    title: notificationTitle,
                    message: notificationMessage,
                    type: notificationType,
                }
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
