import IUser from "./user.model";

export interface EmployeeSchedule extends IUser {
  shift?: string;
}

export interface ScheduleDetails {
  date?: Date;
  scheduleTemplate?: string;
  employeesSelected: EmployeeSchedule[];
}
