import { Route, Routes } from "react-router-dom";
import Calendar from "./calendar";
import { GlobalStateContext } from "../../configs/global-state-provider";
import React from "react";
import AddSchedule from "./manager/add-schedule";
import { PATHS, ROLES } from "../../configs/constants";

const ScheduleRoutes = () => {
  const globalState = React.useContext(GlobalStateContext).globalState;

  return (
    <Routes>
      <Route
        path="/"
        element={globalState?.user?.role === ROLES.SCHEDULER ? <Calendar /> : null}
      />
      <Route path={`/${PATHS.CREATE_SCHEDULE}`} element={<AddSchedule />} />
    </Routes>
  );
};

export default ScheduleRoutes;
