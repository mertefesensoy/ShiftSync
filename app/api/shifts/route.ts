import { NextResponse } from 'next/server'
import { prisma } from '@shiftsync/db'

// GET /api/shifts - Get all shifts
export async function GET() {
    try {
        const shifts = await prisma.shift.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        reliabilityScore: true,
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        })

        return NextResponse.json(shifts)
    } catch (error) {
        console.error('Error fetching shifts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shifts' },
            { status: 500 }
        )
    }
}

// POST /api/shifts - Create new shift
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { date, startTime, endTime, role } = body

        // Combine date and time into DateTime objects
        const startDateTime = new Date(`${date}T${startTime}:00`)
        const endDateTime = new Date(`${date}T${endTime}:00`)

        const shift = await prisma.shift.create({
            data: {
                startTime: startDateTime,
                endTime: endDateTime,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        reliabilityScore: true,
                    },
                },
            },
        })

        return NextResponse.json(shift, { status: 201 })
    } catch (error) {
        console.error('Error creating shift:', error)
        return NextResponse.json(
            { error: 'Failed to create shift' },
            { status: 500 }
        )
    }
}
