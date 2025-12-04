"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface WalletContextType {
    balance: number;
    addFunds: (amount: number) => Promise<void>;
    updateBalance: (amount: number) => void; // amount can be negative
    transactions: Transaction[];
    isLoading: boolean;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    createdAt: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setBalance(user.balance);
            fetchTransactions();
        } else {
            setBalance(0);
            setTransactions([]);
        }
    }, [user]);

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/wallet/transactions");
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addFunds = async (amount: number) => {
        try {
            const res = await fetch("/api/wallet/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });

            if (!res.ok) {
                throw new Error("Failed to add funds");
            }

            const data = await res.json();
            setBalance(data.balance);
            fetchTransactions(); // Refresh history
        } catch (error) {
            console.error("Add funds error", error);
            throw error;
        }
    };

    const updateBalance = (amount: number) => {
        // This is for local optimistic updates during games
        // Real sync should happen via API calls in the game logic
        setBalance((prev) => prev + amount);
    };

    return (
        <WalletContext.Provider value={{ balance, addFunds, updateBalance, transactions, isLoading }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within an WalletProvider");
    }
    return context;
}
