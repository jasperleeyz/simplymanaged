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
    requestedRoster: any; // TODO: define roster model
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
    requesterSchedule: any; // TODO: define schedule model
    requestedUser: IUser; // employee who owns the requested shift
    requestedSchedule: any; // TODO: define schedule model
    reason: string;

}