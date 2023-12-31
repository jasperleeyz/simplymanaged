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

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "A",
  INACTIVE: "I",
  A: "ACTIVE",
  I: "INACTIVE",
};

export const PAYMENT_CYCLE = {
  MONTHLY: "MONTHLY",
  ANNUALLY: "ANNUALLY",
};

export const SEQUENCE_KEYS = {
  COMPANY_CODE_SEQUENCE: "company_code_seq",
  COMPANY_CODE_TYPE_SEQUENCE: "company_code_type_seq",
  COMPANY_LOCATION_SEQUENCE: "company_location_seq",
  DEPARTMENT_SEQUENCE: "department_seq",
  ROSTER_SEQUENCE: "roster_seq",
  ROSTER_TEMPLATE_SEQUENCE: "roster_template_seq",
  USER_SEQUENCE: "user_seq",
};

export const DATE = {
  LANGUAGE: "en-SG",
  DDMMYYYY_OPTION: {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  } as Intl.DateTimeFormatOptions,
  DDMMYYYY_HHMM_A_OPTION: {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  } as Intl.DateTimeFormatOptions,
};
