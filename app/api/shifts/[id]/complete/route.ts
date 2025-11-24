import { NextResponse } from 'next/server';
import { prisma } from '@shiftsync/db';

// Mock endpoint to simulate shift completion for testing reliability scores
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { userId, onTime = true } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Verify shift exists and belongs to user
        const shift = await prisma.shift.findUnique({
            where: { id: params.id },
        });

        if (!shift) {
            return NextResponse.json(
                { error: 'Shift not found' },
                { status: 404 }
            );
        }

        if (shift.userId !== userId) {
            return NextResponse.json(
                { error: 'Shift does not belong to this user' },
                { status: 403 }
            );
        }

        // Determine points and description based on completion status
        const points = onTime ? 10 : 3;
        const event = onTime ? 'SHIFT_COMPLETED' : 'SHIFT_COMPLETED_LATE';
        const description = onTime
            ? `Completed shift on time`
            : `Completed shift but arrived late`;

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

        // Mock: Add earnings to user balance
        const start = new Date(shift.startTime);
        const end = new Date(shift.endTime);
        const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const hourlyRate = 20; // Mock rate
        const earnings = hoursWorked * hourlyRate;

        await prisma.user.update({
            where: { id: userId },
            data: {
                lifetimeEarnings: { increment: earnings },
                availableBalance: { increment: earnings },
            },
        });

        return NextResponse.json({
            message: 'Shift completed successfully',
            scoreEvent,
            newScore,
            earnings,
        });
    } catch (error) {
        console.error('Error completing shift:', error);
        return NextResponse.json(
            { error: 'Failed to complete shift' },
            { status: 500 }
        );
    }
}
