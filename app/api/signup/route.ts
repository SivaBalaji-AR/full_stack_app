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
            role
        }: {
            phone_number: string,
            password: string,
            name: string,
            role: string
        } = body;

        if (!phone_number || !password || !role || !name) {
            return NextResponse.json(
                { error: "Phone number, password, name, and role are required" },
                { status: 400 }
            );
        }

        // Validate using string literals
        if (role !== 'consumer' && role !== 'worker' && role !== 'shop_admin' && role !== 'admin') {
            return NextResponse.json(
                { error: "Invalid role. Must be 'consumer', 'worker', 'shop_admin', or 'admin'" },
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

        // Handle consumer role
        if (role === 'consumer') {
            newUser = await prisma.users.create({
                data: {
                    phone_number: phone_number,
                    hashed_password: hashedPassword,
                    name: name,
                    role: 'consumer'
                },
                select: { id: true, phone_number: true, name: true, role: true }
            });
        }

        // Handle worker role
        else if (role === 'worker') {
            const {
                driving_license,
                vehicle_number,
                vehicle_rc
            } = body;

            if (!driving_license || !vehicle_number || !vehicle_rc) {
                return NextResponse.json(
                    { error: "Driving license, vehicle number, and vehicle RC are required for workers" },
                    { status: 400 }
                );
            }

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
        }

        // Handle shop_admin role
        else if (role === 'shop_admin') {
            const { shop_name, shop_address, shop_type } = body;

            if (!shop_name || !shop_type) {
                return NextResponse.json(
                    { error: "Shop name and type are required for shop admins" },
                    { status: 400 }
                );
            }

            // Validate shop type
            if (!['restaurant', 'stationary', 'grocery'].includes(shop_type)) {
                return NextResponse.json(
                    { error: "Invalid shop type. Must be 'restaurant', 'stationary', or 'grocery'" },
                    { status: 400 }
                );
            }

            // Create user and shop in a transaction
            newUser = await prisma.users.create({
                data: {
                    phone_number: phone_number,
                    hashed_password: hashedPassword,
                    name: name,
                    role: 'shop_admin',
                    shops_managed: {
                        create: {
                            name: shop_name,
                            address: shop_address || null,
                            type: shop_type
                        }
                    }
                },
                select: {
                    id: true,
                    phone_number: true,
                    name: true,
                    role: true,
                    shops_managed: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    }
                }
            });
        }

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