import { IRoster, IUserSchedule } from "./schedule.model";
import IUser from "./user.model";

export interface IRequest {
    id: number;
    user_id: number;
    company_id: number;
    type: string;
    status: string;
    created_date: Date;
    created_by: string;
    updated_date: Date;
    updated_by: string;
    bid_request?: IBidRequest;
    leave_request?: ILeaveRequest;
    swap_request?: ISwapRequest;
}


export interface IBidRequest {
    request_id: number;
    requested_roster: IRoster; 
    shift: string;
    start_date: Date;
    end_date: Date;
}


export interface ILeaveRequest {
    request_id: number;
    type: string;
    start_date: Date;
    end_date: Date;
    remarks?: string;
    half_day: string;
    attachment?: string;
    no_of_days: number;
}


export interface ISwapRequest {
    request_id: number;
    requester: IUser;
    requester_schedule: IUserSchedule; 
    requested_user: IUser; // employee who owns the requested shift
    requested_schedule: IUserSchedule; 
    reason: string;
}