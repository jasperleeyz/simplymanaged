import React from "react";
import ErrorBoundaryRoutes from "./shared/error/error-boundary-routes";
import { Route } from "react-router-dom";
import Home from "./modules/home/home";
import ScheduleRoutes from "./modules/schedule";
import RequestRoutes from "./modules/request";
import PageNotFound from "./shared/error/page-not-found";
import ProfileRoutes from "./modules/profile";
import SysAdminRoutes from "./modules/sysadmin";
import { PATHS, ROLES } from "./configs/constants";
import PrivateRoute from "./shared/auth/private-route";
import Login from "./shared/auth/login";

const AppRoutes = () => {
  
  return (
    <div className="md:mx-auto max-w-6xl my-6" style={{ minHeight: "600px" }}>
      <div className="mx-3">
        <ErrorBoundaryRoutes>
          <Route path="/login" element={<Login />} />
          <Route index element={<Home />} />
          <Route
            path={`/${PATHS.MY_PROFILE}/*`}
            element={
              <PrivateRoute>
                <ProfileRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.SCHEDULE}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SCHEDULER, ROLES.EMPLOYEE]}>
                <ScheduleRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.REQUESTS}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SCHEDULER, ROLES.EMPLOYEE]}>
                <RequestRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.EMPLOYEES}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SYSADMIN]}>
                <SysAdminRoutes />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </ErrorBoundaryRoutes>
      </div>
    </div>
  );
};

export default AppRoutes;
