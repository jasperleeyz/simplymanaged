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
      role: ROLES.SCHEDULER,
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
      // {
      //   id: 3,
      //   type: "swap",
      //   status: "pending",
      //   createdDate: new Date(),
      //   createdBy: "John Smith",
      //   updatedDate: new Date(),
      //   updatedBy: "John Smith",
      //   shiftSwapRequest: {
      //     requestId: 3,
      //     requestorShift: "AM",
      //     requestorShiftDate: new Date(2023, 10, 5),
      //     requestedShift: "AM",
      //     requestedShiftDate: new Date(2023, 10, 1),
      //     requestedShiftEmployee: "John Wick",
      //     swapReason: "Unable to work on actual day",
      //   },
      // },
    ]
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
