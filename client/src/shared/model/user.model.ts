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
    department?: any;
    company?: any;
    headOfDepartment?: any;
    employmentDetails?: IEmployementDetails;
    schedules?: any[];
    requests?: any[];
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