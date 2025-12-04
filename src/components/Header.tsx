"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { Bell, LogOut, User, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function Header() {
    const { balance } = useWallet();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Mock notifications
    const notifications = [
        { id: 1, title: "Welcome!", message: "Welcome to GameVerse. Start playing now!", time: "Just now" },
        { id: 2, title: "Bonus", message: "Double your money on your first spin!", time: "1 hour ago" },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 relative z-50">
            <div className="flex items-center">
                <h2 className="text-lg font-semibold text-foreground">Welcome back, {user?.name || "Gamer"}</h2>
            </div>
            <div className="flex items-center space-x-4">
                {/* Balance Display */}
                <div className="flex items-center rounded-full bg-secondary px-4 py-1.5 border border-border">
                    <span className="text-sm text-muted-foreground mr-2">Balance:</span>
                    <span className="text-lg font-bold text-primary">${balance.toFixed(2)}</span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-4 border-b border-border flex justify-between items-center">
                                    <h3 className="font-semibold">Notifications</h3>
                                    <button onClick={() => setIsNotificationsOpen(false)}>
                                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                                <span className="text-xs text-muted-foreground">{notification.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold hover:ring-2 hover:ring-accent/50 transition-all"
                    >
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-4 border-b border-border">
                                    <p className="font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/profile"
                                        className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                    <div className="h-px bg-border my-1"></div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsProfileOpen(false);
                                        }}
                                        className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
