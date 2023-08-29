import React from "react";
import IUser from "../shared/model/user.model";
import { ROLES } from "./constants";
import { ScheduleDetails } from "../shared/model/schedule.model";

type GlobalState = {
  user?: IUser;
  isAuthenticated: boolean;
  workShifts?: any[];
  schedule: ScheduleDetails[];
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
    isAuthenticated: false,
    workShifts: ["AM", "PM", "FULL"],
    schedule: [
      {
        scheduleTemplate: "",
        date: new Date(),
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
        date: new Date("2023-09-30"),
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
