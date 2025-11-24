"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateShiftDialog } from "@/components/create-shift-dialog"
import { EditShiftDialog } from "@/components/edit-shift-dialog"
import { AssignWorkerDialog } from "@/components/assign-worker-dialog"
import { PendingSwaps } from "@/components/pending-swaps"
import { ShiftList } from "@/components/shift-list"
import { canSwap } from "@/lib/swap-validator"
import { type SwapRequest } from "@/lib/swap-types"

interface Shift {
    id: string
    date: string
    startTime: string
    endTime: string
    role: string
    assignedTo?: string
}

interface Worker {
    id: string
    name: string
    email: string
    roles: string[]
    reliabilityScore: number
}

export default function ManagerDashboard() {
    const [shifts, setShifts] = useState<Shift[]>([
        {
            id: "1",
            date: "2025-11-25",
            startTime: "09:00",
            endTime: "17:00",
            role: "Barista",
            assignedTo: "John Doe",
        },
        {
            id: "2",
            date: "2025-11-26",
            startTime: "14:00",
            endTime: "22:00",
            role: "Server",
        },
    ])

    const workers: Worker[] = [
        {
            id: "w1",
            name: "John Doe",
            email: "john.doe@example.com",
            roles: ["Barista", "Server"],
            reliabilityScore: 95,
        },
        {
            id: "w2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            roles: ["Cook", "Cashier"],
            reliabilityScore: 88,
        },
        {
            id: "w3",
            name: "Mike Johnson",
            email: "mike.johnson@example.com",
            roles: ["Barista"],
            reliabilityScore: 92,
        },
        {
            id: "w4",
            name: "Sarah Williams",
            email: "sarah.williams@example.com",
            roles: ["Server", "Cashier"],
            reliabilityScore: 97,
        },
        {
            id: "w5",
            name: "Tom Brown",
            email: "tom.brown@example.com",
            roles: ["Cook"],
            reliabilityScore: 85,
        },
    ]

    const [editingShift, setEditingShift] = useState<Shift | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [assigningShift, setAssigningShift] = useState<Shift | null>(null)
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

    // Mock swap requests
    const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([
        {
            id: "swap1",
            shiftId: "2",
            shiftDate: "2025-11-26",
            shiftStartTime: "14:00",
            shiftEndTime: "22:00",
            shiftRole: "Server",
            requestingWorkerId: "w4",
            requestingWorkerName: "Sarah Williams",
            status: "pending",
            validationResult: canSwap(
                workers.find(w => w.id === "w4")!,
                shifts.find(s => s.id === "2")!,
                shifts
            ),
            createdAt: new Date().toISOString(),
        },
        {
            id: "swap2",
            shiftId: "1",
            shiftDate: "2025-11-25",
            shiftStartTime: "09:00",
            shiftEndTime: "17:00",
            shiftRole: "Barista",
            requestingWorkerId: "w2",
            requestingWorkerName: "Jane Smith",
            currentAssignee: "John Doe",
            status: "pending",
            validationResult: canSwap(
                workers.find(w => w.id === "w2")!,
                shifts.find(s => s.id === "1")!,
                shifts
            ),
            createdAt: new Date().toISOString(),
        },
    ])

    const handleShiftCreated = (newShift: {
        date: string
        startTime: string
        endTime: string
        role: string
    }) => {
        const shift: Shift = {
            id: Math.random().toString(36).substr(2, 9),
            ...newShift,
        }
        setShifts([...shifts, shift])
    }

    const handleEditShift = (shift: Shift) => {
        setEditingShift(shift)
        setIsEditDialogOpen(true)
    }

    const handleShiftUpdated = (updatedShift: Shift) => {
        setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s))
    }

    const handleDeleteShift = (shiftId: string) => {
        setShifts(shifts.filter(s => s.id !== shiftId))
    }

    const handleAssignWorker = (shift: Shift) => {
        setAssigningShift(shift)
        setIsAssignDialogOpen(true)
    }

    const handleWorkerAssigned = (shiftId: string, workerId: string, workerName: string) => {
        setShifts(shifts.map(s =>
            s.id === shiftId ? { ...s, assignedTo: workerName } : s
        ))
    }

    const handleApproveSwap = (requestId: string) => {
        const request = swapRequests.find(r => r.id === requestId)
        if (!request || !request.validationResult.canSwap) return

        // Assign the shift to the requesting worker
        setShifts(shifts.map(s =>
            s.id === request.shiftId
                ? { ...s, assignedTo: request.requestingWorkerName }
                : s
        ))

        // Mark request as approved
        setSwapRequests(swapRequests.map(r =>
            r.id === requestId
                ? { ...r, status: "approved" as const, reviewedAt: new Date().toISOString() }
                : r
        ))
    }

    const handleRejectSwap = (requestId: string) => {
        setSwapRequests(swapRequests.map(r =>
            r.id === requestId
                ? { ...r, status: "rejected" as const, reviewedAt: new Date().toISOString() }
                : r
        ))
    }

    const openShifts = shifts.filter((s) => !s.assignedTo).length
    const totalShifts = shifts.length

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
                    <PendingSwaps
                        swapRequests={swapRequests}
                        onApprove={handleApproveSwap}
                        onReject={handleRejectSwap}
                    />
                    <ShiftList
                        shifts={shifts}
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
                                    <p className="text-sm font-medium leading-none">Sarah Williams claimed a shift</p>
                                    <p className="text-sm text-muted-foreground">Pending approval</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Jane Smith requested swap</p>
                                    <p className="text-sm text-muted-foreground">Validation failed</p>
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
                    allShifts={shifts}
                    open={isAssignDialogOpen}
                    onOpenChange={setIsAssignDialogOpen}
                    onWorkerAssigned={handleWorkerAssigned}
                />
            )}
        </div>
    )
}
