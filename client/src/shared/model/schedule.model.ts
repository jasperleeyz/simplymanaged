import { ICompanyLocation } from "./company.model";
import IUser from "./user.model";

export interface IRosterTemplate {
  id?: number;
  company_id: number;
  roster_type: string,
  name: string;
  no_of_employees: number;
  created_by: string;
  created_date?: Date;
  updated_by: string;
  updated_date?: Date;
  positions?: IRosterTemplatePosition[];
}

export interface IRosterTemplatePosition {
  roster_template_id?: number;
  company_id?: number;
  position: string;
  count: number;
}

export interface IRosterPosition {
  roster_id?: number;
  company_id: number;
  position: string;
  count: number;
}

export interface IRoster {
  id?: number;
  company_id: number;
  location_id?: number;
  department_id?: number;
  start_date: Date;
  end_date: Date;
  type: string;
  created_by: string;
  created_date?: Date;
  updated_by: string;
  updated_date?: Date;
  employees?: IUser[];
  schedules?:IUserSchedule[];
  location?: ICompanyLocation;
  positions?: IRosterPosition[];
}

export interface IUserSchedule {
  id?: number;
  user_id: number;
  user_company_id: number;
  roster_id?: number;
  start_date: Date;
  end_date: Date;
  shift: string;
  status: string;
  created_by: string;
  created_date?: Date;
  updated_by: string;
  updated_date?: Date;
  roster?: IRoster;
  user?: IUser;
}


