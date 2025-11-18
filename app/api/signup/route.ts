import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';

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
            role: string // <--- Just use string here
        } = body;

        if (!phone_number || !password || !role || !name) {
            return NextResponse.json(
                { error: "Phone number, password, name, and role are required" },
                { status: 400 } 
            );
        }

        // Validate using string literals
        if (role !== 'consumer' && role !== 'worker') {
            return NextResponse.json(
                { error: "Invalid role. Must be 'consumer' or 'worker'" },
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

        // Use string literal "consumer"
        // Prisma automatically maps string "consumer" to Enum consumer
        if (role === 'consumer') {
            const newUser = await prisma.users.create({
                data: {
                    phone_number: phone_number,
                    hashed_password: hashedPassword,
                    name: name,
                    role: 'consumer' // <--- Pass string directly
                },
                select: { id: true, phone_number: true, name: true, role: true }
            });
            return NextResponse.json({ user: newUser }, { status: 201 });
        }

        // Use string literal "worker"
        if (role === 'worker') {
            
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

            const newWorker = await prisma.users.create({
                data: {
                    phone_number: phone_number,
                    hashed_password: hashedPassword,
                    name: name,
                    role: 'worker', // <--- Pass string directly
                    
                    worker_profiles: {
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
                    worker_profiles: { select: { driving_license: true }}
                }
            });
            return NextResponse.json({ user: newWorker }, { status: 201 });
        }

    } catch (error: any) {
        console.error("Signup Error:", error);
        if (error.code === 'P2002') {
             return NextResponse.json({ error: "A user with this phone number already exists." }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}