import { NextResponse } from 'next/server'
import { prisma } from '@shiftsync/db'

// PUT /api/shifts/[id] - Update shift
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { date, startTime, endTime, role, userId } = body

        const updateData: any = {}

        // Only update date/time if provided
        if (date && startTime && endTime) {
            updateData.startTime = new Date(`${date}T${startTime}:00`)
            updateData.endTime = new Date(`${date}T${endTime}:00`)
        }

        if (role) {
            updateData.role = role
        }

        // Handle assignment (userId can be string or null)
        if ('userId' in body) {
            updateData.userId = userId
        }

        const shift = await prisma.shift.update({
            where: { id: params.id },
            data: updateData,
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

        return NextResponse.json(shift)
    } catch (error) {
        console.error('Error updating shift:', error)
        return NextResponse.json(
            { error: 'Failed to update shift' },
            { status: 500 }
        )
    }
}

// DELETE /api/shifts/[id] - Delete shift
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.shift.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting shift:', error)
        return NextResponse.json(
            { error: 'Failed to delete shift' },
            { status: 500 }
        )
    }
}
