export const API_URL = !import.meta.env.DEV
  ? "https://simplymanaged-server.onrender.com/api"
  : "http://localhost:3000/api";

export const MONTHS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

export const ROLES = {
  SUPERADMIN: "SA",
  MANAGER: "M",
  EMPLOYEE: "E",
  SYSADMIN: "A",
};

export const PATHS = {
  SCHEDULE: "schedule",
  CREATE_SCHEDULE: "create-schedule",
  EDIT_SCHEDULE: "edit-schedule",
  VIEW_SCHEDULE: "view-schedule",

  MY_PROFILE: "my-profile",
  EDIT_PROFILE: "edit",

  REQUESTS: "requests",
  VIEW_REQUEST: "view",
  ADD_REQUEST: "add",
  ADD_LEAVE_REQUEST: "add?type=leave",
  ADD_SWAP_REQUEST: "add?type=swap",

  EMPLOYEES: "employees",
  ADD_EMPLOYEE: "add",
  VIEW_EMPLOYEE: "view",
  EDIT_EMPLOYEE: "edit",

  CODE: "code",
  VIEW_CODE: "view",
  ADD_CODE: "add",
  EDIT_CODE: "edit",

  REGISTRATION: "registration",
  VIEW_REGISTRATION: "view",

  COMPANY: "company",
  EDIT_COMPANY: "edit",

  DEPARTMENT: "department",
  VIEW_DEPARTMENT: "view",
  ADD_DEPARTMENT: "add",
  EDIT_DEPARTMENT: "edit",

  COMPANY_CODE: "company-code",
  VIEW_COMPANY_CODE: "view",
  ADD_COMPANY_CODE: "add",
  EDIT_COMPANY_CODE: "edit",

  LOCATION: "location",
  VIEW_LOCATION: "view",
  ADD_LOCATION: "add",
  EDIT_LOCATION: "edit",
};

export const DATE = {
  LANGUAGE: "en-SG",
  MOMENT_DDMMYYYY: "DD/MM/yyyy",
  DDMMYYYY_HHMM_A_OPTION: {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  } as Intl.DateTimeFormatOptions,
};

export const REGISTRATION_STATUS = {
  PENDING: "P",
  APPROVED: "A",
  REJECTED: "R",
  R: "REJECTED",
  P: "PENDING",
  A: "APPROVED",
};

export const CODE_STATUS = {
  ACTIVE: "A",
  INACTIVE: "I",
  A: "ACTIVE",
  I: "INACTIVE",
};

export const USER_STATUS = {
  ACTIVE: "A",
  INACTIVE: "I",
  A: "ACTIVE",
  I: "INACTIVE",
};

export const REQUEST_STATUS = {
  PENDING: "P",
  APPROVED: "A",
  REJECTED: "R",
  R: "REJECTED",
  P: "PENDING",
  A: "APPROVED",
};

export const REQUEST = {
  STATUS: {
    PENDING: "P",
    APPROVED: "A",
    REJECTED: "R",
    R: "REJECTED",
    P: "PENDING",
    A: "APPROVED",
  },
  TYPE: {
    LEAVE: "LEAVE",
    SWAP: "SWAP",
    BID: "BID",
  },
}

export const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const ATTACHMENT_REQUIRED_LEAVES = ["MC", "HL"];