import { ICompany, IDepartment } from "./company.model";
import { IRequest } from "./request.model";
import { IUserSchedule } from "./schedule.model";

interface IUser {
    id: number;
    company_id: number;
    fullname: string;
    email: string;
    contact_no: string;
    role: string;
    position: string;
    profile_image?: string;
    status?: string;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
    preferences?: IUserPreference[]; 
    department_id?: number;
    department?: IDepartment;
    company?: ICompany;
    department_in_charge?: IDepartment;
    employment_details?: IEmployementDetails;
    schedules?: IUserSchedule[];
    requests?: IRequest[];
    leave_balance?: IUserLeaveBalance[];
}

export default IUser;


export interface IUserPreference {
    id: number;
    user_id: number;
    user_company_id: number;
    module: string;
    preference: string;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}

export interface IEmployementDetails {
    user_id: number;
    user_company_id: number;
    working_hours: string;
    employment_type: string;
}

export interface IUserLeaveBalance {
    id: number;
    user_id: number;
    user_company_id: number;
    leave_type: string;
    balance: number;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}