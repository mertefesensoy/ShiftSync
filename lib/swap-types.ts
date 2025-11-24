/**
 * Swap Request Types
 * 
 * Defines the data structures for shift swap requests made by workers
 */

import { type CanSwapResult } from "./swap-validator"

export type SwapRequestStatus = "pending" | "approved" | "rejected" | "auto-approved"

export interface SwapRequest {
    id: string
    shiftId: string
    shiftDate: string
    shiftStartTime: string
    shiftEndTime: string
    shiftRole: string
    requestingWorkerId: string
    requestingWorkerName: string
    currentAssignee?: string
    status: SwapRequestStatus
    validationResult: CanSwapResult
    createdAt: string
    reviewedAt?: string
    reviewedBy?: string
}
