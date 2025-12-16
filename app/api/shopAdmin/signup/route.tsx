import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { shop_type } from '@/lib/generated/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            phone_number,
            password,
            name,
            shop_name, 
            shop_address, 
            shop_type
        }: {
            phone_number: string,
            password: string,
            name: string,
            shop_name: string,
            shop_address?: string,
            shop_type: string
        } = body;

        if (!phone_number || !password || !name || !shop_name || !shop_type) {
            return NextResponse.json(
                { error: "Phone number, password, name, shop name and type are required" },
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
                        type: shop_type as shop_type
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