import { NextResponse } from 'next/server';
import { prisma } from '@shiftsync/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const scoreHistory = await prisma.scoreEvent.findMany({
            where: { userId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 events
        });

        return NextResponse.json(scoreHistory);
    } catch (error) {
        console.error('Error fetching score history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch score history' },
            { status: 500 }
        );
    }
}
