"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { Ticket, Trophy, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TICKET_OPTIONS = [
    { amount: 50, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20" },
    { amount: 100, color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20" },
    { amount: 200, color: "from-orange-500 to-orange-600", shadow: "shadow-orange-500/20" },
    { amount: 500, color: "from-red-500 to-red-600", shadow: "shadow-red-500/20" },
];

interface TicketType {
    id: number;
    amount: number;
    status: string;
    purchasedAt: string;
}

export default function LuckyDrawPage() {
    const { balance, refreshTransactions, updateBalance } = useWallet();
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/game/lucky-draw/tickets");
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyTicket = async (amount: number) => {
        if (balance < amount) {
            setError("Insufficient balance");
            return;
        }

        setPurchasing(amount);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch("/api/game/lucky-draw/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to buy ticket");
            }

            // Update local state
            updateBalance(-amount);
            setTickets([data.ticket, ...tickets]);
            setSuccess(`Successfully purchased $${amount} ticket!`);
            refreshTransactions(); // Update transaction history

        } catch (err: any) {
            setError(err.message);
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 uppercase tracking-wider">
                    Lucky Draw
                </h1>
                <p className="text-muted-foreground text-lg">Buy a ticket for a chance to win massive prizes!</p>
            </div>

            {/* Ticket Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TICKET_OPTIONS.map((option) => (
                    <div
                        key={option.amount}
                        className={cn(
                            "relative group overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:scale-105",
                            option.shadow
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 opacity-10 bg-gradient-to-br transition-opacity group-hover:opacity-20",
                            option.color
                        )} />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
                                option.color
                            )}>
                                <Ticket className="w-8 h-8" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold">${option.amount} Ticket</h3>
                                <p className="text-sm text-muted-foreground">Entry for grand prize</p>
                            </div>

                            <button
                                onClick={() => handleBuyTicket(option.amount)}
                                disabled={purchasing !== null || balance < option.amount}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r",
                                    option.color
                                )}
                            >
                                {purchasing === option.amount ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    "Buy Now"
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Messages */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5" /> {error}
                </div>
            )}
            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-500 animate-in slide-in-from-top-2">
                    <CheckCircle className="h-5 w-5" /> {success}
                </div>
            )}

            {/* My Tickets */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" /> My Tickets
                    </h3>
                    <span className="text-sm text-muted-foreground">Total: {tickets.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground">You haven't purchased any tickets yet.</div>
                    ) : (
                        tickets.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Ticket className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Ticket #{ticket.id}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(ticket.purchasedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">${ticket.amount}</div>
                                    <div className="text-xs uppercase font-bold text-green-500">{ticket.status}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
