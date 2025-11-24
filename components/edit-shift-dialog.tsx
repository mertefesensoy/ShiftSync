"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Shift {
    id: string
    date: string
    startTime: string
    endTime: string
    role: string
    assignedTo?: string
}

interface EditShiftDialogProps {
    shift: Shift
    open: boolean
    onOpenChange: (open: boolean) => void
    onShiftUpdated: (shift: Shift) => void
}

export function EditShiftDialog({ shift, open, onOpenChange, onShiftUpdated }: EditShiftDialogProps) {
    const [date, setDate] = useState(shift.date)
    const [startTime, setStartTime] = useState(shift.startTime)
    const [endTime, setEndTime] = useState(shift.endTime)
    const [role, setRole] = useState(shift.role)

    // Update form when shift changes
    useEffect(() => {
        setDate(shift.date)
        setStartTime(shift.startTime)
        setEndTime(shift.endTime)
        setRole(shift.role)
    }, [shift])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onShiftUpdated({
            ...shift,
            date,
            startTime,
            endTime,
            role,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Shift</DialogTitle>
                    <DialogDescription>
                        Make changes to the shift details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-start-time">Start Time</Label>
                                <Input
                                    id="edit-start-time"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-end-time">End Time</Label>
                                <Input
                                    id="edit-end-time"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role Required</Label>
                            <Select value={role} onValueChange={setRole} required>
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Barista">Barista</SelectItem>
                                    <SelectItem value="Server">Server</SelectItem>
                                    <SelectItem value="Cook">Cook</SelectItem>
                                    <SelectItem value="Cashier">Cashier</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
