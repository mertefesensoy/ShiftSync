import { NextResponse } from 'next/server';
import { prisma } from '@shiftsync/db';

// Mock endpoint to add earnings for testing payouts
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { amount, description = 'Mock earnings added' } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Valid amount is required' },
                { status: 400 }
            );
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: params.id },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update user's earnings and balance
        await prisma.user.update({
            where: { id: params.id },
            data: {
                lifetimeEarnings: { increment: amount },
                availableBalance: { increment: amount },
            },
        });

        return NextResponse.json({
            message: description,
            amount,
            newLifetimeEarnings: user.lifetimeEarnings + amount,
            newAvailableBalance: user.availableBalance + amount,
        });
    } catch (error) {
        console.error('Error adding earnings:', error);
        return NextResponse.json(
            { error: 'Failed to add earnings' },
            { status: 500 }
        );
    }
}
