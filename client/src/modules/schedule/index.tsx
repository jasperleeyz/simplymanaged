import { Route, Routes } from "react-router-dom";
import Calendar from "./calendar";
import { GlobalStateContext } from "../../configs/global-state-provider";
import React from "react";
import AddSchedule from "./manager/add-schedule";
import { PATHS, ROLES } from "../../configs/constants";
import PrivateRoute from "../../shared/auth/private-route";
import ViewSchedule from "./manager/view-schedule";

const ScheduleRoutes = () => {
  const globalState = React.useContext(GlobalStateContext).globalState;

  return (
    <Routes>
      <Route path="/" element={<Calendar />} />
      <Route
        path={`/${PATHS.CREATE_SCHEDULE}`}
        element={
          <PrivateRoute hasAnyRoles={[ROLES.SCHEDULER]}>
            <AddSchedule />
          </PrivateRoute>
        }
      />
      <Route
        path={`/${PATHS.EDIT_SCHEDULE}`}
        element={
          <PrivateRoute hasAnyRoles={[ROLES.SCHEDULER]}>
            <AddSchedule />
          </PrivateRoute>
        }
      />
      <Route path={`/${PATHS.VIEW_SCHEDULE}`} element={<ViewSchedule />} />
    </Routes>
  );
};

export default ScheduleRoutes;
