"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50"></div>
                    </div>
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
