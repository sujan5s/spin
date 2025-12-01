"use client";

import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { Bell, User } from "lucide-react";

export function Header() {
    const { balance } = useWallet();
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center">
                <h2 className="text-lg font-semibold text-foreground">Welcome back, {user?.name || "Gamer"}</h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center rounded-full bg-secondary px-4 py-1.5 border border-border">
                    <span className="text-sm text-muted-foreground mr-2">Balance:</span>
                    <span className="text-lg font-bold text-primary">${balance.toFixed(2)}</span>
                </div>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
            </div>
        </header>
    );
}
