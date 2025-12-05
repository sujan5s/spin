import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "INSERT_CLIENT_ID_HERE";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        console.log("Received Google Token:", token.substring(0, 10) + "...");
        console.log("Using Client ID:", GOOGLE_CLIENT_ID ? "Set" : "Not Set");

        // Verify Google Token
        // For dev/mock purposes, if token starts with "mock_", we skip real verification
        let payload;
        if (token.startsWith("mock_")) {
            payload = {
                email: "mock_user@gmail.com",
                name: "Mock User",
                sub: "mock_google_id_12345",
            };
        } else {
            try {
                // Try verifying as ID Token first
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch (e) {
                // If ID Token verification fails, try using it as Access Token to get user info
                try {
                    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        payload = {
                            email: data.email,
                            name: data.name,
                            sub: data.sub,
                        };
                    } else {
                        throw new Error("Failed to fetch user info");
                    }
                } catch (error) {
                    return NextResponse.json({ error: "Invalid Google Token" }, { status: 400 });
                }
            }
        }

        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid Token Payload" }, { status: 400 });
        }

        const { email, name, sub: googleId } = payload;

        // Find or Create User
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || "Google User",
                    googleId,
                    password: "", // No password for Google users
                },
            });
        } else if (!user.googleId) {
            // Link Google Account if user exists but not linked
            user = await prisma.user.update({
                where: { email },
                data: { googleId },
            });
        }

        // Generate JWT
        const jwt = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(JWT_SECRET);

        // Create response with cookie
        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    balance: user.balance,
                },
            },
            { status: 200 }
        );

        response.cookies.set("token", jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Google Auth Error Details:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}
