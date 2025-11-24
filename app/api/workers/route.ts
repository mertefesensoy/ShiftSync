import { NextResponse } from 'next/server'
import { prisma } from '@shiftsync/db'

// GET /api/workers - Get all workers
export async function GET() {
    try {
        const workers = await prisma.user.findMany({
            where: {
                role: 'WORKER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                reliabilityScore: true,
            },
            orderBy: {
                name: 'asc',
            },
        })

        return NextResponse.json(workers)
    } catch (error) {
        console.error('Error fetching workers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workers' },
            { status: 500 }
        )
    }
}
