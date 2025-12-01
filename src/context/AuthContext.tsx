"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    signup: (email: string, name: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem("gaming_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (email: string) => {
        // Mock login
        const mockUser = { email, name: email.split("@")[0] };
        setUser(mockUser);
        localStorage.setItem("gaming_user", JSON.stringify(mockUser));
        router.push("/dashboard");
    };

    const signup = (email: string, name: string) => {
        // Mock signup
        const mockUser = { email, name };
        setUser(mockUser);
        localStorage.setItem("gaming_user", JSON.stringify(mockUser));
        router.push("/dashboard");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("gaming_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                signup,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
