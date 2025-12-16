import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            phone_number,
            password,
            name,
            driving_license,
            vehicle_number,
            vehicle_rc
        }: {
            phone_number: string,
            password: string,
            name: string,
            driving_license: string,
            vehicle_number: string,
            vehicle_rc: string
        } = body;

        if (!phone_number || !password || !name || !driving_license ||
            !vehicle_number ||
            !vehicle_rc) {
            return NextResponse.json(
                { error: "Phone number, password, name, driving license, vehicle number, and vehicle RC are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.users.findUnique({
            where: { phone_number }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Phone number already in use" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser: any;

        newUser = await prisma.users.create({
            data: {
                phone_number: phone_number,
                hashed_password: hashedPassword,
                name: name,
                role: 'worker',
                worker_profile: {
                    create: {
                        driving_license: driving_license,
                        vehicle_number: vehicle_number,
                        vehicle_rc: vehicle_rc
                    }
                }
            },
            select: {
                id: true,
                phone_number: true,
                name: true,
                role: true,
                worker_profile: { select: { driving_license: true } }
            }
        });

        // Generate JWT token (once for all roles)
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }

        const token = jwt.sign(
            { userId: newUser.id, role: newUser.role, phone: newUser.phone_number },
            jwtSecret,
            { expiresIn: '1d' }
        );

        return NextResponse.json({ token:token }, { status: 201 });

    } catch (error: any) {
        console.error("Signup Error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "A user with this phone number already exists." }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}