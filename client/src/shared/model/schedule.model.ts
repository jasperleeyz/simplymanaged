import { ICompanyLocation } from "./company.model";
import IUser from "./user.model";

export interface IRosterTemplate {
  id: number;
  companyId: number;
  name: string;
  noOfEmployees: number;
  positions: IRosterTemplatePosition[];
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
}

export interface IRosterTemplatePosition {
  rosterTemplateId: number;
  companyId: number;
  position: string;
  count: number;
}

export interface IRoster {
  id: number;
  companyId: number;
  locationId: number;
  departmentId: number;
  startDate: Date;
  endDate: Date;
  type: string;
  createdBy: string;
  createdDate?: Date;
  updatedBy: string;
  updatedDate?: Date;
  employees: IUser[];
  location?: ICompanyLocation;
}

export interface IUserSchedule {
  id?: number;
  user_id: number;
  user_company_id: number;
  roster_id: number;
  start_date: Date;
  end_date: Date;
  shift: string;
  status: string;
  attendance?: string;
  created_by: string;
  createdDate?: Date;
  updated_by: string;
  updatedDate?: Date;
}


