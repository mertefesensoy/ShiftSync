import { NextResponse } from 'next/server'
import { prisma } from '@shiftsync/db'

// PUT /api/swaps/[id] - Approve or reject swap request
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { status, reviewedBy } = body

        // Get the swap request first
        const swapRequest = await prisma.swapRequest.findUnique({
            where: { id: params.id },
        })

        if (!swapRequest) {
            return NextResponse.json(
                { error: 'Swap request not found' },
                { status: 404 }
            )
        }

        // Update the swap request status
        const updatedSwapRequest = await prisma.swapRequest.update({
            where: { id: params.id },
            data: {
                status,
                reviewedAt: new Date(),
                reviewedBy,
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

        // If approved, assign the shift to the requesting worker
        if (status === 'approved') {
            await prisma.shift.update({
                where: { id: swapRequest.shiftId },
                data: { userId: swapRequest.requestingWorkerId },
            })
        }

        return NextResponse.json(updatedSwapRequest)
    } catch (error) {
        console.error('Error updating swap request:', error)
        return NextResponse.json(
            { error: 'Failed to update swap request' },
            { status: 500 }
        )
    }
}
