"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { AlertCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENTS = [
    { label: "2x", value: 2, color: "#00ff9d" },
    { label: "0x", value: 0, color: "#ef4444" },
    { label: "1.5x", value: 1.5, color: "#00e5ff" },
    { label: "0x", value: 0, color: "#ef4444" },
    { label: "3x", value: 3, color: "#f59e0b" },
    { label: "0x", value: 0, color: "#ef4444" },
    { label: "1.2x", value: 1.2, color: "#a855f7" },
    { label: "0.5x", value: 0.5, color: "#ef4444" },
];

export default function SpinPage() {
    const { balance, updateBalance } = useWallet();
    const [betAmount, setBetAmount] = useState<string>("");
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<{ multiplier: number; winAmount: number } | null>(null);
    const wheelRef = useRef<HTMLDivElement>(null);

    const handleSpin = () => {
        const bet = parseFloat(betAmount);
        if (!bet || bet <= 0 || bet > balance) return;

        setIsSpinning(true);
        setResult(null);
        updateBalance(-bet); // Deduct bet immediately

        // Randomize result
        // To make it realistic, let's pick a random segment
        const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
        const segment = SEGMENTS[segmentIndex];

        // Calculate rotation
        // Each segment is 360 / 8 = 45 degrees
        // We want to land on the segment. 
        // If index 0 is at top (0 deg), index 1 is at 45 deg, etc.
        // But we rotate the wheel, so we need to rotate negative amount or just add full spins.
        // Let's say we want index `i` to be at the top pointer.
        // The top is 0 degrees (or 270 depending on CSS).
        // Let's assume 0 degrees is top.
        // Segment `i` starts at `i * 45` and ends at `(i+1) * 45`.
        // Center of segment `i` is `i * 45 + 22.5`.
        // To bring that to top (0/360), we need to rotate `360 - (i * 45 + 22.5)`.
        // Plus some extra spins.

        const segmentAngle = 360 / SEGMENTS.length;
        const targetAngle = 360 - (segmentIndex * segmentAngle + segmentAngle / 2);
        const extraSpins = 360 * 5; // 5 full spins
        const totalRotation = rotation + extraSpins + targetAngle - (rotation % 360);
        // Wait, simple math: current rotation + 5 spins + offset to target.
        // Actually, just setting a new absolute rotation is easier.

        const newRotation = rotation + 1800 + (360 - (segmentIndex * 45 + 22.5)); // 1800 = 5 * 360

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            const winAmount = bet * segment.value;
            if (winAmount > 0) {
                updateBalance(winAmount);
            }
            setResult({ multiplier: segment.value, winAmount });
        }, 5000); // 5 seconds spin
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                    Spin & Win
                </h1>
                <p className="text-muted-foreground">Double your money in seconds!</p>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* Wheel Container */}
                <div className="relative">
                    {/* Pointer */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-foreground clip-path-polygon-[50%_100%,_0_0,_100%_0] shadow-xl"></div>

                    {/* Wheel */}
                    <div
                        ref={wheelRef}
                        className="w-80 h-80 md:w-96 md:h-96 rounded-full border-4 border-border relative overflow-hidden shadow-[0_0_50px_rgba(0,255,157,0.2)] transition-transform cubic-bezier(0.1, 0.7, 0.1, 1)"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transitionDuration: isSpinning ? "5s" : "0s",
                        }}
                    >
                        {SEGMENTS.map((seg, i) => (
                            <div
                                key={i}
                                className="absolute w-full h-full top-0 left-0"
                                style={{
                                    transform: `rotate(${i * 45}deg)`,
                                }}
                            >
                                <div
                                    className="w-full h-full absolute top-0 left-0 flex justify-center pt-4 font-bold text-black"
                                    style={{
                                        backgroundColor: seg.color,
                                        clipPath: "polygon(50% 50%, 0 0, 100% 0)",
                                        transform: "rotate(22.5deg)", // Adjust to align segment
                                    }}
                                >
                                    <span className="transform -rotate-22.5 mt-4 text-lg">{seg.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Center Cap */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-card rounded-full border-2 border-primary z-10 flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-sm space-y-6 bg-card border border-border p-6 rounded-xl">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Your Balance</span>
                        <span className="font-bold text-primary">${balance.toFixed(2)}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Bet Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                placeholder="0.00"
                                disabled={isSpinning}
                            />
                        </div>
                        {parseFloat(betAmount) > balance && (
                            <p className="text-destructive text-xs mt-2 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Insufficient balance
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleSpin}
                        disabled={isSpinning || !betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                        className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                    >
                        {isSpinning ? "Spinning..." : "SPIN NOW"}
                    </button>

                    {result && (
                        <div className={cn(
                            "mt-4 p-4 rounded-lg text-center animate-in fade-in slide-in-from-bottom-4",
                            result.multiplier > 0 ? "bg-primary/20 border border-primary/50" : "bg-destructive/20 border border-destructive/50"
                        )}>
                            {result.multiplier > 0 ? (
                                <div>
                                    <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                                        <Trophy className="h-5 w-5" /> YOU WON!
                                    </h3>
                                    <p className="text-foreground">
                                        Multiplier: {result.multiplier}x <br />
                                        Winnings: ${result.winAmount.toFixed(2)}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold text-destructive">Better Luck Next Time</h3>
                                    <p className="text-muted-foreground">You lost ${parseFloat(betAmount).toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
