import { Route, Routes } from "react-router-dom";
import RegistrationForm from "./registration-form";
import PrivateRoute from "../../shared/auth/private-route";
import ViewRegistration from "./super-admin/view-registration";
import RegistrationDetails from "./super-admin/registration-details";
import { PATHS, ROLES } from "../../configs/constants";

const RegistrationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RegistrationForm />} />
      <Route
        path={`/${PATHS.VIEW_REGISTRATION}`}
        element={
          <PrivateRoute hasAnyRoles={[ROLES.SUPERADMIN]}>
            <ViewRegistration />
          </PrivateRoute>
        }
      />
      <Route
        path={`/${PATHS.VIEW_REGISTRATION}/:id`}
        element={
          <PrivateRoute hasAnyRoles={[ROLES.SUPERADMIN]}>
            <RegistrationDetails />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default RegistrationRoutes;
