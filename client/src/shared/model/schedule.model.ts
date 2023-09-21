import IUser from "./user.model";

export interface EmployeeSchedule extends IUser {
  shift?: string;
  attendance?: string;
}

export interface ScheduleDetails {
  id: number;
  date?: Date;
  location?: string;
  scheduleTemplate?: string;
  employeesSelected: EmployeeSchedule[];
}
