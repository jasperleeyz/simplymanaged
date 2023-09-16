export const MONTHS = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
]

export const ROLES = {
    SCHEDULER: 'S',
    EMPLOYEE: 'E',
    SYSADMIN: 'A'
}

export const PATHS = {
    SCHEDULE: 'schedule',
    CREATE_SCHEDULE: 'create-schedule',
    EDIT_SCHEDULE: 'edit-schedule',
    VIEW_SCHEDULE: 'view-schedule',

    MY_PROFILE: 'my-profile',
    EDIT_PROFILE: 'edit',

    REQUESTS: 'requests',
    VIEW_REQUEST: 'view-request',

    EMPLOYEES: 'employees',
    ADD_EMPLOYEE: 'add',
}

export const DATE = {
    LANGUAGE: 'en-SG',
    DDMMYYYY_HHMM_A_OPTION: {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true} as Intl.DateTimeFormatOptions,

}