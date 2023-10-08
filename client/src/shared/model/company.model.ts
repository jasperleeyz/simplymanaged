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
    approve_status: string;
    created_by: string;
    created_date: Date;
    updated_by: string;
    updated_date: Date;
}

export interface ICompany {
    id: number;
    uen: string;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    industry: string;
    noOfEmployees: number;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
    subscriptions?: ISubscription[];
    roleBasedAccessControls?: IRoleBasedAccessControl[];
    departments?: IDepartment[];
    locations?: ICompanyLocation[];
    rosterTemplates?: IRosterTemplate[];
    rosters?: IRoster[]; 
}

export interface ISubscription {
    id: number;
    companyId: number;
    type: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}

export interface IDepartment {
    id: number;
    companyId: number;
    name: string;
    departmentHead?: IUser;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
    employees?: IUser[];
    rosters?: IRoster[];
}

export interface ICompanyCode {
    id: number;
    companyId: number;
    codeType: string;
    code: string;
    description: string;
    status: string;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}

export interface ICompanyLocation {
    id: number;
    companyId: number;
    name: string;
    address: string;
    postalCode?: string;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}

export interface IRoleBasedAccessControl {
    id: number;
    companyId: number;
    role: string;
    module: string;
    accessType: string;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}