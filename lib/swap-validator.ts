/**
 * Swap Validator
 * 
 * Core business logic for ShiftSync's autonomous shift swapping.
 * Validates whether a worker can take over a shift based on:
 * - Skill matching
 * - Scheduling conflicts
 * - Weekly hour limits
 * - Reliability thresholds
 */

export interface Worker {
    id: string
    name: string
    email: string
    roles: string[]
    reliabilityScore: number
}

export interface Shift {
    id: string
    date: string
    startTime: string
    endTime: string
    role: string
    assignedTo?: string
}

export interface CanSwapResult {
    canSwap: boolean
    reason?: string
}

/**
 * Validates if a worker can take a shift
 */
export function canSwap(
    worker: Worker,
    shift: Shift,
    allShifts: Shift[]
): CanSwapResult {
    // Rule 1: Skill Matching - CRITICAL
    if (!worker.roles.includes(shift.role)) {
        return {
            canSwap: false,
            reason: `Worker does not have the required skill: ${shift.role}`,
        }
    }

    // Rule 2: Reliability Threshold - Quality Control
    const MIN_RELIABILITY = 80
    if (worker.reliabilityScore < MIN_RELIABILITY) {
        return {
            canSwap: false,
            reason: `Reliability score too low: ${worker.reliabilityScore}% (minimum: ${MIN_RELIABILITY}%)`,
        }
    }

    // Rule 3: Scheduling Conflict Check - CRITICAL
    const workerShifts = allShifts.filter(s => s.assignedTo === worker.name)
    const hasConflict = workerShifts.some(existingShift => {
        // Skip if it's the same shift (for edit scenarios)
        if (existingShift.id === shift.id) return false

        // Check if shifts are on the same date
        if (existingShift.date !== shift.date) return false

        // Check for time overlap
        return doTimesOverlap(
            existingShift.startTime,
            existingShift.endTime,
            shift.startTime,
            shift.endTime
        )
    })

    if (hasConflict) {
        return {
            canSwap: false,
            reason: `Scheduling conflict: Worker already has a shift on ${shift.date}`,
        }
    }

    // Rule 4: Weekly Hour Limit - Prevent Overwork
    const MAX_WEEKLY_HOURS = 40
    const weeklyHours = calculateWeeklyHours(worker, shift, allShifts)

    if (weeklyHours > MAX_WEEKLY_HOURS) {
        return {
            canSwap: false,
            reason: `Would exceed weekly hour limit: ${weeklyHours.toFixed(1)}hrs (max: ${MAX_WEEKLY_HOURS}hrs)`,
        }
    }

    // All validations passed!
    return {
        canSwap: true,
    }
}

/**
 * Check if two time ranges overlap
 */
function doTimesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    const start1Minutes = timeToMinutes(start1)
    const end1Minutes = timeToMinutes(end1)
    const start2Minutes = timeToMinutes(start2)
    const end2Minutes = timeToMinutes(end2)

    // Two ranges overlap if one starts before the other ends
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes
}

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

/**
 * Calculate total hours for a worker in the same week as the shift
 */
function calculateWeeklyHours(
    worker: Worker,
    newShift: Shift,
    allShifts: Shift[]
): number {
    // Get the week boundaries for the new shift
    const shiftDate = new Date(newShift.date)
    const weekStart = getWeekStart(shiftDate)
    const weekEnd = getWeekEnd(shiftDate)

    // Find all shifts for this worker in the same week
    const workerShiftsInWeek = allShifts.filter(shift => {
        if (shift.assignedTo !== worker.name) return false
        if (shift.id === newShift.id) return false // Exclude the shift being swapped

        const date = new Date(shift.date)
        return date >= weekStart && date <= weekEnd
    })

    // Calculate total hours
    let totalHours = 0

    // Add existing shifts' hours
    for (const shift of workerShiftsInWeek) {
        totalHours += calculateShiftHours(shift.startTime, shift.endTime)
    }

    // Add new shift hours
    totalHours += calculateShiftHours(newShift.startTime, newShift.endTime)

    return totalHours
}

/**
 * Calculate hours for a single shift
 */
function calculateShiftHours(startTime: string, endTime: string): number {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    return (endMinutes - startMinutes) / 60
}

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    const weekStart = new Date(date)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
}

/**
 * Get the end of the week (Sunday) for a given date
 */
function getWeekEnd(date: Date): Date {
    const weekStart = getWeekStart(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return weekEnd
}
