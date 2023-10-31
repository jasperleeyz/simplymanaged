import React from "react";
import IUser from "../shared/model/user.model";
import { ROLES } from "./constants";
import { IRoster, IUserSchedule } from "../shared/model/schedule.model";
import { IRequest } from "../shared/model/request.model";

type GlobalState = {
  user?: IUser;
  isAuthenticated: boolean;
  sessionFetched: boolean;
  workShifts?: any[];
  locations?: string[];
  schedule?: IUserSchedule[];
  roster?: IRoster[];
  requests?: IRequest[];
  employees?: IUser[];
};

export const InitialGlobalState: GlobalState = {
  user: {} as IUser,
  isAuthenticated: false,
  sessionFetched: false,
  workShifts: [],
  locations: [],
  schedule: [],
  roster: [],
  requests: [],
  employees: [],
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
    user: {} as IUser,
    isAuthenticated: false,
    sessionFetched: false,
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
