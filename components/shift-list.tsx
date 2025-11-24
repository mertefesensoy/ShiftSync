import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
}

export function ShiftList({ shifts }: ShiftListProps) {
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
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{shift.role}</p>
                                        {!shift.assignedTo && (
                                            <Badge variant="outline">Open</Badge>
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
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
