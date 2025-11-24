"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateShiftDialog } from "@/components/create-shift-dialog"
import { ShiftList } from "@/components/shift-list"

interface Shift {
    id: string
    date: string
    startTime: string
    endTime: string
    role: string
    assignedTo?: string
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
                        <CardTitle className="text-sm font-medium">Reliability Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground">Team average</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <ShiftList shifts={shifts} />
                </div>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">John Doe requested a swap</p>
                                    <p className="text-sm text-muted-foreground">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Jane Smith clocked in</p>
                                    <p className="text-sm text-muted-foreground">1 hour ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

