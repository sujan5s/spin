import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email } = await req.json();


        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email') || !process.env.EMAIL_PASS || process.env.EMAIL_PASS.includes('your-app-password')) {
            console.error("Missing or default email credentials in .env");
            return NextResponse.json({ error: "Server configuration error: Email credentials not set" }, { status: 500 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to DB
        await prisma.otpVerification.upsert({
            where: { email },
            update: { otp, expiresAt },
            create: { email, otp, expiresAt },
        });

        // Send Email via Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail", // Or use 'host' and 'port' for other providers
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${otp}`,
            html: `<p>Your verification code is: <b>${otp}</b></p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[OTP] Sent to ${email}`);

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("OTP Send Error Details:", error);
        return NextResponse.json({ error: "Failed to send OTP", details: String(error) }, { status: 500 });
    }
}
