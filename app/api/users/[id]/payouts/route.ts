import { NextResponse } from 'next/server';
import { prisma } from '@shiftsync/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const payouts = await prisma.payoutRequest.findMany({
            where: { userId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 payouts
        });

        return NextResponse.json(payouts);
    } catch (error) {
        console.error('Error fetching payouts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payouts' },
            { status: 500 }
        );
    }
}
