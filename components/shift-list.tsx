import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, UserPlus } from "lucide-react"

interface Shift {
    id: string
    date: string
    startTime: string
    endTime: string
    role: string
    assignedTo?: string
}

interface ShiftListProps {
    shifts: Shift[]
    onEditShift: (shift: Shift) => void
    onDeleteShift: (shiftId: string) => void
    onAssignWorker: (shift: Shift) => void
}

export function ShiftList({ shifts, onEditShift, onDeleteShift, onAssignWorker }: ShiftListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
                {shifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No shifts scheduled. Create your first shift to get started!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {shifts.map((shift) => (
                            <div
                                key={shift.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{shift.role}</p>
                                        {!shift.assignedTo && (
                                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                Open
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(shift.date).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {shift.startTime} - {shift.endTime}
                                        </p>
                                        {shift.assignedTo && (
                                            <p className="text-sm text-muted-foreground">
                                                {shift.assignedTo}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!shift.assignedTo && (
                                            <Button
                                                size="icon"
                                                variant="default"
                                                onClick={() => onAssignWorker(shift)}
                                                title="Assign worker"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onEditShift(shift)}
                                            title="Edit shift"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onDeleteShift(shift.id)}
                                            title="Delete shift"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
