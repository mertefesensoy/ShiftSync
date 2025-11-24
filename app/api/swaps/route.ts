import { NextResponse } from 'next/server'
import { prisma } from '@shiftsync/db'

// GET /api/swaps - Get all swap requests
export async function GET() {
    try {
        const swapRequests = await prisma.swapRequest.findMany({
            include: {
                shift: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                requestingWorker: {
                    select: {
                        id: true,
                        name: true,
                        reliabilityScore: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(swapRequests)
    } catch (error) {
        console.error('Error fetching swap requests:', error)
        return NextResponse.json(
            { error: 'Failed to fetch swap requests' },
            { status: 500 }
        )
    }
}

// POST /api/swaps - Create swap request
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { shiftId, requestingWorkerId, validationPassed, validationReason } = body

        const swapRequest = await prisma.swapRequest.create({
            data: {
                shiftId,
                requestingWorkerId,
                validationPassed,
                validationReason,
                status: validationPassed ? 'auto-approved' : 'pending',
            },
            include: {
                shift: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                requestingWorker: {
                    select: {
                        id: true,
                        name: true,
                        reliabilityScore: true,
                    },
                },
            },
        })

        // If auto-approved, assign the shift
        if (validationPassed) {
            await prisma.shift.update({
                where: { id: shiftId },
                data: { userId: requestingWorkerId },
            })
        }

        return NextResponse.json(swapRequest, { status: 201 })
    } catch (error) {
        console.error('Error creating swap request:', error)
        return NextResponse.json(
            { error: 'Failed to create swap request' },
            { status: 500 }
        )
    }
}
