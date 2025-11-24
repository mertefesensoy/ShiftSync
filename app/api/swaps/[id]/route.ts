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

            // Award points for successful claim approval
            const user = await prisma.user.findUnique({
                where: { id: swapRequest.requestingWorkerId },
            });

            if (user) {
                await prisma.scoreEvent.create({
                    data: {
                        userId: swapRequest.requestingWorkerId,
                        event: 'CLAIM_APPROVED',
                        points: 5,
                        description: 'Successfully claimed shift',
                    },
                });

                // Update user's reliability score (with bounds: 0-150)
                const newScore = Math.max(0, Math.min(150, user.reliabilityScore + 5));
                await prisma.user.update({
                    where: { id: swapRequest.requestingWorkerId },
                    data: { reliabilityScore: newScore },
                });
            }
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

// DELETE /api/swaps/[id] - Delete swap request (Undo)
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Get the swap request first to check status
        const swapRequest = await prisma.swapRequest.findUnique({
            where: { id: params.id },
        })

        if (!swapRequest) {
            return NextResponse.json(
                { error: 'Swap request not found' },
                { status: 404 }
            )
        }

        // If it was approved or auto-approved, we need to unassign the shift
        if (swapRequest.status === 'approved' || swapRequest.status === 'auto-approved') {
            await prisma.shift.update({
                where: { id: swapRequest.shiftId },
                data: { userId: null },
            })
        }

        // Delete the swap request
        await prisma.swapRequest.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting swap request:', error)
        return NextResponse.json(
            { error: 'Failed to delete swap request' },
            { status: 500 }
        )
    }
}
