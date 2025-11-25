import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@shiftsync/db';

export async function POST(request: Request) {
    try {
        const { email, password, name, role } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
                role: role || 'WORKER',
            }
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('=== Registration Error Details ===');
        console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Error message:', error instanceof Error ? error.message : error);
        console.error('Full error:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('==================================');

        return NextResponse.json(
            { error: 'Failed to register user', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
