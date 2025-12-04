"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Gamepad2, ArrowRight } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup(email, name, password);
        } catch (error) {
            alert("Signup failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background"></div>

            <div className="relative z-10 w-full max-w-md p-8 bg-card/50 backdrop-blur-lg border border-border rounded-xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 border border-accent/50">
                        <Gamepad2 className="h-8 w-8 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Join the Game</h1>
                    <p className="text-muted-foreground mt-2">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-muted-foreground transition-all"
                            placeholder="ProGamer123"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-muted-foreground transition-all"
                            placeholder="player@gameverse.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-muted-foreground transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center"
                    >
                        Sign Up <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-accent hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
