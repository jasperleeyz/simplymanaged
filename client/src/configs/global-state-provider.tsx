import React from "react";
import IUser from "../shared/model/user.model";
import { ROLES } from "./constants";
import { ScheduleDetails } from "../shared/model/schedule.model";
import { Request } from "../shared/model/request.model";

type GlobalState = {
  user?: IUser;
  isAuthenticated: boolean;
  workShifts?: any[];
  schedule: ScheduleDetails[];
  requests: Request[];
  employee: IUser[];
};

interface GlobalStateContextProps {
  readonly globalState: GlobalState | null;
  readonly setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export const GlobalStateContext = React.createContext<GlobalStateContextProps>({
  globalState: {} as any,
  setGlobalState: () => {},
});

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalState, setGlobalState] = React.useState<GlobalState>({
    user: {
      id: 1,
      name: "JOHN DOE",
      email: "JOHNDOE@SIMPLYMANAGED.COM",
      phoneNo: "99999999",
      role: ROLES.SYSADMIN,
      position: "STORE MANAGER",
      employmentType: "FULL-TIME",
      profileImage:
        "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
    },
    isAuthenticated: true,
    workShifts: ["AM", "PM", "FULL"],
    schedule: [
      {
        scheduleTemplate: "",
        date: new Date(),
        location: "Toa Payoh",
        employeesSelected: [
          {
            id: 2,
            name: "JOHN WICK",
            email: "JOHNWICK@SIMPLYMANAGED.COM",
            phoneNo: "88888888",
            role: "E",
            position: "MANAGER",
            employmentType: "FULL-TIME",
            shift: "PM",
          },
          {
            id: 1,
            name: "JOHN DOE",
            email: "JOHNDOE@SIMPLYMANAGED.COM",
            phoneNo: "99999999",
            role: ROLES.SCHEDULER,
            position: "STORE MANAGER",
            employmentType: "FULL-TIME",
            shift: "AM",
          },
        ],
      },
      {
        scheduleTemplate: "",
        date: new Date("2023-09-30"),
        location: "Toa Payoh",
        employeesSelected: [
          {
            id: 2,
            name: "JOHN WICK",
            email: "JOHNWICK@SIMPLYMANAGED.COM",
            phoneNo: "88888888",
            role: "E",
            position: "MANAGER",
            employmentType: "FULL-TIME",
            shift: "PM",
          },
        ],
      },
      {
        scheduleTemplate: "",
        date: new Date("2023-09-04"),
        employeesSelected: [
          {
            id: 4,
            name: "HARRY POTTER",
            email: "HARRYPOTTER@SIMPLYMANAGED.COM",
            phoneNo: "66666666",
            role: "E",
            position: "SERVER",
            employmentType: "PART-TIME",
            shift: "FULL",
          },
        ],
      },
      {
        scheduleTemplate: "",
        date: new Date("2023-10-01"),
        location: "Toa Payoh",
        employeesSelected: [
          {
            id: 2,
            name: "JOHN WICK",
            email: "JOHNWICK@SIMPLYMANAGED.COM",
            phoneNo: "88888888",
            role: "E",
            position: "MANAGER",
            employmentType: "FULL-TIME",
            shift: "PM",
          },
          {
            id: 4,
            name: "HARRY POTTER",
            email: "HARRYPOTTER@SIMPLYMANAGED.COM",
            phoneNo: "66666666",
            role: "E",
            position: "SERVER",
            employmentType: "PART-TIME",
            shift: "FULL",
          },
        ],
      },
    ],
    requests: [
      {
        id: 1,
        type: "shift",
        status: "pending",
        createdDate: new Date(),
        createdBy: "John Smith",
        updatedDate: new Date(),
        updatedBy: "John Smith",
        shiftRequest: {
          requestId: 1,
          shift: "PM",
          shiftDate: new Date(),
        },
      },
      {
        id: 2,
        type: "leave",
        status: "pending",
        createdDate: new Date(),
        createdBy: "John Smith",
        updatedDate: new Date(),
        updatedBy: "John Smith",
        leaveRequest: {
          requestId: 2,
          leaveType: "Annual",
          leaveDateFrom: new Date(2023, 11, 1, 8, 30, 0, 0),
          leaveDateTo: new Date(2023, 11, 7, 18, 0, 0, 0),
          isHalfDay: false,
        },
      },
      {
        id: 3,
        type: "swap",
        status: "pending",
        createdDate: new Date(),
        createdBy: "John Smith",
        updatedDate: new Date(),
        updatedBy: "John Smith",
        shiftSwapRequest: {
          requestId: 3,
          requestorShift: "AM",
          requestorShiftDate: new Date(2023, 10, 5),
          requestedShift: "AM",
          requestedShiftDate: new Date(2023, 10, 1),
          requestedShiftEmployee: "John Wick",
          swapReason: "Unable to work on actual day",
        },
      },
    ],
    employee: [
      {
        id: 2,
        name: "John Wick",
        email: "johnwick@simplymanaged.com",
        phoneNo: "98765544",
        role: "E",
        position: "Manager",
        employmentType: "Full-Time",
        status: 'Active',
      },
      {
        id: 3,
        name: "Deadpool",
        email: "deadpool@simplymanaged.com",
        phoneNo: "98355241",
        role: "S",
        position: "Barista",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 4,
        name: "Harry Potter",
        email: "harrypotter@simplymanaged.com",
        phoneNo: "98877551",
        role: "A",
        position: "Server",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 5,
        name: "Snow White",
        email: "snowwhite@simplymanaged.com",
        phoneNo: "97583311",
        role: "E",
        position: "Manager",
        employmentType: "Full-Time",
        status: 'Active',
      },
      {
        id: 6,
        name: "Tom Cruise",
        email: "tomcruise@simplymanaged.com",
        phoneNo: "96784786",
        role: "E",
        position: "Barista",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 7,
        name: "John Snow",
        email: "johnsnow@simplymanaged.com",
        phoneNo: "96657483",
        role: "E",
        position: "Server",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 8,
        name: "Sherlock Holmes",
        email: "sherlockholmes@simplymanaged.com",
        phoneNo: "91346654",
        role: "E",
        position: "Manager",
        employmentType: "Full-Time",
        status: 'Active',
      },
      {
        id: 9,
        name: "Watson White",
        email: "watsonwhite@simplymanged.com",
        phoneNo: "97766564",
        role: "E",
        position: "Barista",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 10,
        name: "Jim Moriaty",
        email: "jimmoriaty@simplymanaged.com",
        phoneNo: "98833243",
        role: "E",
        position: "Server",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 11,
        name: "Irene Adler",
        email: "ireneadler@simplymanaged.com",
        phoneNo: "96554677",
        role: "E",
        position: "Manager",
        employmentType: "Full-Time",
        status: 'Active',
      },
      {
        id: 12,
        name: "Allen Walker",
        email: "allenwalker@simplymanaged.com",
        phoneNo: "91128875",
        role: "E",
        position: "Barista",
        employmentType: "Part-Time",
        status: 'Active',
      },
      {
        id: 13,
        name: "Percy Jackson",
        email: "percyjackson@simplymanaged.com",
        phoneNo: "99844112",
        role: "E",
        position: "Server",
        employmentType: "Part-Time",
        status: 'Active',
      },
    ],
  });

  const value = React.useMemo(
    () => ({ globalState, setGlobalState }),
    [globalState]
  );

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
