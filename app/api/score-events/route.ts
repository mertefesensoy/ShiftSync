import { NextResponse } from 'next/server';
import { prisma } from '@shiftsync/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, event, points, description } = body;

        if (!userId || !event || points === undefined || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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

        // Create score event
        const scoreEvent = await prisma.scoreEvent.create({
            data: {
                userId,
                event,
                points,
                description,
            },
        });

        // Update user's reliability score (with bounds: 0-150)
        const newScore = Math.max(0, Math.min(150, user.reliabilityScore + points));

        await prisma.user.update({
            where: { id: userId },
            data: { reliabilityScore: newScore },
        });

        return NextResponse.json({ scoreEvent, newScore });
    } catch (error) {
        console.error('Error creating score event:', error);
        return NextResponse.json(
            { error: 'Failed to create score event' },
            { status: 500 }
        );
    }
}
