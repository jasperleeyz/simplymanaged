import React from "react";
import ErrorBoundaryRoutes from "./shared/error/error-boundary-routes";
import { Route } from "react-router-dom";
import Home from "./modules/home/home";
import ScheduleRoutes from "./modules/schedule";
import RequestRoutes from "./modules/request";
import PageNotFound from "./shared/error/page-not-found";
import ProfileRoutes from "./modules/profile";
import { PATHS, ROLES } from "./configs/constants";
import PrivateRoute from "./shared/auth/private-route";
import Login from "./shared/auth/login";
import RegistrationRoutes from "./modules/registration";
import CodeManagementRoutes from "./modules/code-management";
import EmployeeManagementRoutes from "./modules/employee-management";
import DepartmentManagementRoutes from "./modules/department-management";
import LocationManagementRoutes from "./modules/location-management";
import CompanyCodeManagementRoutes from "./modules/company-code-management";
import CompanyManagementRoutes from "./modules/company-management";
import ForgetPassword from "./shared/auth/forget-password";
import ResetPassword from "./shared/auth/reset-password";

const AppRoutes = () => {
  return (
    <div className="md:mx-auto max-w-6xl my-6" style={{ minHeight: "600px" }}>
      <div className="mx-3">
        <ErrorBoundaryRoutes>
          <Route path="/registration/*" element={<RegistrationRoutes />} />
          <Route path="/login" element={<Login />} />
          <Route path="forget-password" element={<ForgetPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            index
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.CODE}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SUPERADMIN]}>
                <CodeManagementRoutes />
              </PrivateRoute>
            }
          />
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
              <PrivateRoute hasAnyRoles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
                <ScheduleRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.REQUESTS}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
                <RequestRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.EMPLOYEES}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SYSADMIN]}>
                <EmployeeManagementRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.DEPARTMENT}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SYSADMIN]}>
                <DepartmentManagementRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.LOCATION}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SYSADMIN]}>
                <LocationManagementRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.COMPANY_CODE}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SYSADMIN]}>
                <CompanyCodeManagementRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path={`/${PATHS.COMPANY}/*`}
            element={
              <PrivateRoute hasAnyRoles={[ROLES.SYSADMIN]}>
                <CompanyManagementRoutes />
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
