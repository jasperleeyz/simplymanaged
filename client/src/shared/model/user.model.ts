import { ICompany, IDepartment } from "./company.model";
import { IRequest } from "./request.model";
import { IUserSchedule } from "./schedule.model";

interface IUser {
    id: number;
    companyId: number;
    fullname: string;
    email: string;
    contactNo: string;
    role: string;
    position: string;
    profileImage?: string;
    status?: string;
    createdBy?: string;
    createdDate?: Date;
    updatedBy?: string;
    updatedDate?: Date;
    preferences?: IUserPreference[]; 
    department?: IDepartment;
    company?: ICompany;
    headOfDepartment?: IDepartment;
    employmentDetails?: IEmployementDetails;
    schedules?: IUserSchedule[];
    requests?: IRequest[];
}

export default IUser;


export interface IUserPreference {
    id: number;
    userId: number;
    userCompanyId: number;
    module: string;
    preference: string;
    createdBy?: string;
    createdDate?: Date;
    updatedBy?: string;
    updatedDate?: Date;
}

export interface IEmployementDetails {
    userId: number;
    userCompanyId: number;
    workingHours: number;
    employmentType: string;
}