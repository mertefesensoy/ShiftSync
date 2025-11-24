"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateShiftDialog } from "@/components/create-shift-dialog"
import { EditShiftDialog } from "@/components/edit-shift-dialog"
import { AssignWorkerDialog } from "@/components/assign-worker-dialog"
import { ShiftList } from "@/components/shift-list"

interface DBShift {
    id: string
    startTime: string
    endTime: string
    role: string
    userId: string | null
    user: {
        id: string
        name: string | null
        email: string | null
        reliabilityScore: number
    } | null
}

interface Shift {
    id: string
    date: string
    startTime: string
    endTime: string
    role: string
    assignedTo?: string
    userId?: string | null
}

interface Worker {
    id: string
    name: string | null
    email: string | null
    reliabilityScore: number
}

// Helper function to convert DB shift to app shift format
function convertDBShift(dbShift: DBShift): Shift {
    const start = new Date(dbShift.startTime)
    const end = new Date(dbShift.endTime)

    return {
        id: dbShift.id,
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        role: dbShift.role,
        assignedTo: dbShift.user?.name || undefined,
        userId: dbShift.userId,
    }
}

export default function ManagerDashboard() {
    const [shifts, setShifts] = useState<Shift[]>([])
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [editingShift, setEditingShift] = useState<Shift | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [assigningShift, setAssigningShift] = useState<Shift | null>(null)
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

    // Fetch shifts and workers on mount
    useEffect(() => {
        fetchShifts()
        fetchWorkers()
    }, [])

    async function fetchShifts() {
        try {
            const response = await fetch('/api/shifts')
            if (!response.ok) throw new Error('Failed to fetch shifts')
            const data: DBShift[] = await response.json()
            setShifts(data.map(convertDBShift))
        } catch (error) {
            console.error('Error fetching shifts:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchWorkers() {
        try {
            const response = await fetch('/api/workers')
            if (!response.ok) throw new Error('Failed to fetch workers')
            const data = await response.json()
            setWorkers(data)
        } catch (error) {
            console.error('Error fetching workers:', error)
        }
    }

    const handleShiftCreated = async (newShift: {
        date: string
        startTime: string
        endTime: string
        role: string
    }) => {
        try {
            const response = await fetch('/api/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShift),
            })

            if (!response.ok) throw new Error('Failed to create shift')

            const dbShift: DBShift = await response.json()
            setShifts([...(shifts || []), convertDBShift(dbShift)])
        } catch (error) {
            console.error('Error creating shift:', error)
            alert('Failed to create shift')
        }
    }

    const handleEditShift = (shift: Shift) => {
        setEditingShift(shift)
        setIsEditDialogOpen(true)
    }

    const handleShiftUpdated = async (updatedShift: Shift) => {
        try {
            const response = await fetch(`/api/shifts/${updatedShift.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedShift),
            })

            if (!response.ok) throw new Error('Failed to update shift')

            const dbShift: DBShift = await response.json()
            setShifts(shifts?.map(s => s.id === dbShift.id ? convertDBShift(dbShift) : s) || [])
        } catch (error) {
            console.error('Error updating shift:', error)
            alert('Failed to update shift')
        }
    }

    const handleDeleteShift = async (shiftId: string) => {
        try {
            const response = await fetch(`/api/shifts/${shiftId}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete shift')

            setShifts(shifts?.filter(s => s.id !== shiftId) || [])
        } catch (error) {
            console.error('Error deleting shift:', error)
            alert('Failed to delete shift')
        }
    }

    const handleAssignWorker = (shift: Shift) => {
        setAssigningShift(shift)
        setIsAssignDialogOpen(true)
    }

    const handleWorkerAssigned = async (shiftId: string, workerId: string, workerName: string) => {
        try {
            const response = await fetch(`/api/shifts/${shiftId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: workerId }),
            })

            if (!response.ok) throw new Error('Failed to assign worker')

            const dbShift: DBShift = await response.json()
            setShifts(shifts?.map(s => s.id === shiftId ? convertDBShift(dbShift) : s) || [])
        } catch (error) {
            console.error('Error assigning worker:', error)
            alert('Failed to assign worker')
        }
    }

    const openShifts = shifts?.filter((s) => !s.assignedTo).length || 0
    const totalShifts = shifts?.length || 0

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-xl text-muted-foreground">Loading...</div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
                <CreateShiftDialog onShiftCreated={handleShiftCreated} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalShifts}</div>
                        <p className="text-xs text-muted-foreground">
                            {openShifts} open, {totalShifts - openShifts} filled
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openShifts}</div>
                        <p className="text-xs text-muted-foreground">Needs assignment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{workers.length}</div>
                        <p className="text-xs text-muted-foreground">Available for shifts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <ShiftList
                        shifts={shifts || []}
                        onEditShift={handleEditShift}
                        onDeleteShift={handleDeleteShift}
                        onAssignWorker={handleAssignWorker}
                    />
                </div>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Database Connected!</p>
                                    <p className="text-sm text-muted-foreground">Using Neon PostgreSQL</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {editingShift && (
                <EditShiftDialog
                    shift={editingShift}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onShiftUpdated={handleShiftUpdated}
                />
            )}

            {assigningShift && (
                <AssignWorkerDialog
                    shift={assigningShift}
                    workers={workers}
                    allShifts={shifts || []}
                    open={isAssignDialogOpen}
                    onOpenChange={setIsAssignDialogOpen}
                    onWorkerAssigned={handleWorkerAssigned}
                />
            )}
        </div>
    )
}
