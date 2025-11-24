import { NextResponse } from 'next/server';
import { prisma } from '@shiftsync/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, amount, method } = body;

        if (!userId || !amount || !method) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (method !== 'INSTANT' && method !== 'STANDARD') {
            return NextResponse.json(
                { error: 'Invalid payout method. Use INSTANT or STANDARD' },
                { status: 400 }
            );
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user has sufficient balance
        if (user.availableBalance < amount) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            );
        }

        // Calculate fee (2% for instant, 0% for standard)
        const fee = method === 'INSTANT' ? amount * 0.02 : 0;
        const totalDeduction = amount;

        // Create payout request
        const payout = await prisma.payoutRequest.create({
            data: {
                userId,
                amount,
                fee,
                method,
                status: 'completed', // Mock: immediately completed
                completedAt: new Date(),
            },
        });

        // Update user's available balance
        await prisma.user.update({
            where: { id: userId },
            data: {
                availableBalance: { decrement: totalDeduction },
            },
        });

        const newBalance = user.availableBalance - totalDeduction;

        return NextResponse.json({
            payout,
            newBalance,
            message: method === 'INSTANT'
                ? 'Instant payout completed! Funds will arrive in minutes.'
                : 'Standard payout initiated. Funds will arrive in 2-3 business days.',
        });
    } catch (error) {
        console.error('Error creating payout:', error);
        return NextResponse.json(
            { error: 'Failed to create payout' },
            { status: 500 }
        );
    }
}
