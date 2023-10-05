import { IRoster, IUserSchedule } from "./schedule.model";
import IUser from "./user.model";

export interface IRequest {
    id: number;
    userId: number;
    companyId: number;
    type: string;
    status: string;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    bidRequest?: IBidRequest;
    leaveRequest?: ILeaveRequest;
    swapRequest?: ISwapRequest;
}


export interface IBidRequest {
    requestId: number;
    requestedRoster: IRoster; 
    shift: string;
    startDate: Date;
    endDate: Date;
}


export interface ILeaveRequest {
    requestId: number;
    type: string;
    startDate: Date;
    endDate: Date;
    remarks?: string;
    isHalfDay: boolean;
}


export interface ISwapRequest {
    requestId: number;
    requester: IUser;
    requesterSchedule: IUserSchedule; 
    requestedUser: IUser; // employee who owns the requested shift
    requestedSchedule: IUserSchedule; 
    reason: string;
}