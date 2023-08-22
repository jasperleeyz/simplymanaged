import React from "react";
import IUser from "../shared/model/user.model";
import { ROLES } from "./constants";


type GlobalState = {
  user?: IUser;
  isAuthenticated: boolean;
  workShifts?: any[];
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
      phoneNo: 99999999,
      role: ROLES.SCHEDULER,
      position: "STORE MANAGER",
      employmentType: "FULL-TIME",
      profileImage: "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
    },
    isAuthenticated: false,
    workShifts: ["AM", "PM"],
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
