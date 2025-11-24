"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserCheck, AlertCircle, CheckCircle2 } from "lucide-react"
import { canSwap, type Worker, type Shift } from "@/lib/swap-validator"

interface AssignWorkerDialogProps {
    shift: Shift
    workers: Worker[]
    allShifts: Shift[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onWorkerAssigned: (shiftId: string, workerId: string, workerName: string) => void
}

export function AssignWorkerDialog({
    shift,
    workers,
    allShifts,
    open,
    onOpenChange,
    onWorkerAssigned
}: AssignWorkerDialogProps) {
    // Validate each worker and include validation result
    const workersWithValidation = workers.map(worker => ({
        worker,
        validation: canSwap(worker, shift, allShifts)
    }))

    // Filter to show eligible workers first, then ineligible ones
    const eligibleWorkers = workersWithValidation.filter(w => w.validation.canSwap)
    const ineligibleWorkers = workersWithValidation.filter(w => !w.validation.canSwap)

    const handleAssign = (worker: Worker) => {
        onWorkerAssigned(shift.id, worker.id, worker.name)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Assign Worker to Shift</DialogTitle>
                    <DialogDescription>
                        Select a worker to assign to this {shift.role} shift on{" "}
                        {new Date(shift.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}{" "}
                        from {shift.startTime} to {shift.endTime}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {eligibleWorkers.length === 0 && ineligibleWorkers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No workers available
                        </p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {/* Eligible Workers */}
                            {eligibleWorkers.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Eligible Workers ({eligibleWorkers.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {eligibleWorkers.map(({ worker }) => (
                                            <div
                                                key={worker.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors border-green-200 bg-green-50/30"
                                            >
                                                <div className="space-y-1 flex-1">
                                                    <p className="font-medium">{worker.name}</p>
                                                    <p className="text-sm text-muted-foreground">{worker.email}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        {worker.roles.map((role) => (
                                                            <Badge key={role} variant="secondary" className="text-xs">
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">
                                                            {worker.reliabilityScore}%
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Reliability</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAssign(worker)}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Assign
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ineligible Workers */}
                            {ineligibleWorkers.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-orange-600" />
                                        Not Eligible ({ineligibleWorkers.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {ineligibleWorkers.map(({ worker, validation }) => (
                                            <div
                                                key={worker.id}
                                                className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 opacity-60"
                                            >
                                                <div className="space-y-1 flex-1">
                                                    <p className="font-medium">{worker.name}</p>
                                                    <p className="text-sm text-orange-600 flex items-center gap-2">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {validation.reason}
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        {worker.roles.map((role) => (
                                                            <Badge key={role} variant="outline" className="text-xs">
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {worker.reliabilityScore}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Reliability</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
