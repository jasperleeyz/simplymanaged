export interface Request {
    id: number;
    type: string;
    status: string;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    shiftRequest?: ShiftRequest;
    leaveRequest?: LeaveRequest;
    shiftSwapRequest?: ShiftSwapRequest;
}


export interface ShiftRequest {
    requestId: number;
    shift: string;
    shiftDate: Date;

}


export interface LeaveRequest {
    requestId: number;
    leaveType: string;
    leaveDateFrom: Date;
    leaveDateTo: Date;
    leaveReason?: string;
    isHalfDay: boolean;

}


export interface ShiftSwapRequest {
    requestId: number;
    requestorShift: string; // original shift of the requestor
    requestorShiftDate: Date; // original shift date of the requestor
    requestedShift: string; // requested shift
    requestedShiftDate: Date; // requested shift date
    requestedShiftEmployee: string; // employee who owns the requested shift
    swapReason: string;

}