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
    role_based_access_controls?: IRoleBasedAccessControl[];
    departments?: IDepartment[];
    locations?: ICompanyLocation[];
    roster_templates?: IRosterTemplate[];
    rosters?: IRoster[]; 
}

export interface ISubscription {
    id: number;
    company_id: number;
    type: string;
    start_date: Date;
    end_date?: Date;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
}

export interface IDepartment {
    id: number;
    company_id: number;
    name: string;
    department_head?: IUser;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
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
    postal_code?: string;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
}

export interface IRoleBasedAccessControl {
    id: number;
    company_id: number;
    role: string;
    module: string;
    access_type: string;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
}