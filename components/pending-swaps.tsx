"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { type SwapRequest } from "@/lib/swap-types"

interface PendingSwapsProps {
    swapRequests: SwapRequest[]
    onApprove: (requestId: string) => void
    onReject: (requestId: string) => void
}

export function PendingSwaps({ swapRequests, onApprove, onReject }: PendingSwapsProps) {
    const pendingRequests = swapRequests.filter(req => req.status === "pending")

    const getStatusIcon = (canSwap: boolean) => {
        return canSwap ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
            <AlertCircle className="h-4 w-4 text-orange-600" />
        )
    }

    const getStatusBadge = (status: SwapRequest["status"]) => {
        const variants = {
            pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
            approved: { label: "Approved", className: "bg-green-100 text-green-800" },
            rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
            "auto-approved": { label: "Auto-Approved", className: "bg-blue-100 text-blue-800" },
        }
        const variant = variants[status]
        return <Badge className={variant.className}>{variant.label}</Badge>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Pending Swap Requests</CardTitle>
                    <Badge variant="outline" className="ml-2">
                        {pendingRequests.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No pending swap requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                className={`p-4 border rounded-lg ${request.validationResult.canSwap
                                        ? "border-green-200 bg-green-50/30"
                                        : "border-orange-200 bg-orange-50/30"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(request.validationResult.canSwap)}
                                            <p className="font-medium">{request.requestingWorkerName}</p>
                                            <span className="text-sm text-muted-foreground">wants</span>
                                            <Badge variant="secondary">{request.shiftRole}</Badge>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {new Date(request.shiftDate).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}{" "}
                                            • {request.shiftStartTime} - {request.shiftEndTime}
                                        </div>

                                        {!request.validationResult.canSwap && (
                                            <div className="flex items-start gap-2 text-sm text-orange-700">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{request.validationResult.reason}</span>
                                            </div>
                                        )}

                                        {request.validationResult.canSwap && (
                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>All validation checks passed</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => onApprove(request.id)}
                                            disabled={!request.validationResult.canSwap}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onReject(request.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
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
