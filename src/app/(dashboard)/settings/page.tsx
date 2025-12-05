"use client";

import { useState } from "react";
import { Bell, Lock, Shield, Trash2, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences and account security</p>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Notifications
                </h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Email Notifications</div>
                            <div className="text-sm text-muted-foreground">Receive updates about your account activity</div>
                        </div>
                        <button
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifications ? "bg-primary" : "bg-secondary"
                                }`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-6" : "translate-x-0"
                                }`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Push Notifications</div>
                            <div className="text-sm text-muted-foreground">Receive real-time updates about games and wins</div>
                        </div>
                        <button
                            onClick={() => setPushNotifications(!pushNotifications)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${pushNotifications ? "bg-primary" : "bg-secondary"
                                }`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${pushNotifications ? "translate-x-6" : "translate-x-0"
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-primary" /> Appearance
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-muted-foreground">Toggle between light and dark themes</div>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-secondary"
                            }`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? "translate-x-6" : "translate-x-0"
                            }`} />
                    </button>
                </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Security
                </h3>
                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Change Password</div>
                                <div className="text-sm text-muted-foreground">Update your account password</div>
                            </div>
                        </div>
                        <div className="text-sm text-primary font-medium">Update</div>
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500">
                    <Trash2 className="h-5 w-5" /> Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-red-500">Delete Account</div>
                        <div className="text-sm text-red-500/70">Permanently delete your account and all data</div>
                    </div>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
