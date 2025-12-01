"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
    balance: number;
    addFunds: (amount: number) => void;
    updateBalance: (amount: number) => void; // amount can be negative
    transactions: Transaction[];
}

interface Transaction {
    id: string;
    type: "deposit" | "withdraw" | "game_win" | "game_loss";
    amount: number;
    date: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // Load balance from local storage
        const storedBalance = localStorage.getItem("gaming_balance");
        if (storedBalance) {
            setBalance(parseFloat(storedBalance));
        }
        const storedTransactions = localStorage.getItem("gaming_transactions");
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        }
    }, []);

    useEffect(() => {
        // Save to local storage
        localStorage.setItem("gaming_balance", balance.toString());
        localStorage.setItem("gaming_transactions", JSON.stringify(transactions));
    }, [balance, transactions]);

    const addFunds = (amount: number) => {
        setBalance((prev) => prev + amount);
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: "deposit",
            amount,
            date: new Date().toISOString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };

    const updateBalance = (amount: number) => {
        setBalance((prev) => prev + amount);
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: amount >= 0 ? "game_win" : "game_loss",
            amount: Math.abs(amount),
            date: new Date().toISOString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };

    return (
        <WalletContext.Provider value={{ balance, addFunds, updateBalance, transactions }}>
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
