import { IRoster, IRosterTemplate } from "./schedule.model";
import IUser from "./user.model";

export interface IRegistration {
    id: number;
    uen_id: string;
    company_name: string;
    registrant_name: string;
    contact_no: number;
    email: string;
    address: string;
    industry: string;
    no_of_employees: number;
    approve_status?: string;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}

export interface ICompany {
    id: number;
    uen: string;
    name: string;
    contact_no: string;
    email: string;
    address: string;
    industry: string;
    no_of_employees: number;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
    subscriptions?: ISubscription[];
    departments?: IDepartment[];
    locations?: ICompanyLocation[];
    roster_templates?: IRosterTemplate[];
    rosters?: IRoster[]; 
    employees?: IUser[];
    actual_no_of_employees?: number;
    company_leave_balance?: ICompanyLeaveBalance[];
}

export interface ISubscription {
    id: number;
    company_id: number;
    type: string;
    employee_quantity: number;
    status: string;
    start_date: Date;
    end_date?: Date;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}

export interface IDepartment {
    id: number;
    company_id: number;
    department_name: string;
    department_head_id?: number;
    department_head?: IUser;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
    employees?: IUser[];
    rosters?: IRoster[];
}

export interface ICompanyCode {
    id: number;
    company_id: number;
    code_type: string;
    code: string;
    description: string;
    status: string;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
}

export interface ICompanyLocation {
    id: number;
    company_id: number;
    name: string;
    address: string;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}

export interface ICompanyLeaveBalance {
    id: number;
    company_id: number;
    leave_type: string;
    balance: number;
    require_doc: boolean;
    auto_approve: boolean;
    has_half_day: boolean;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}