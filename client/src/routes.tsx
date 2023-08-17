import React from "react";
import ErrorBoundaryRoutes from "./shared/error/error-boundary-routes";
import { Route } from "react-router-dom";
import Home from "./modules/home/home";
import ScheduleRoutes from "./modules/schedule";
import ModuleTwoRoutes from "./modules/module-two";
import PageNotFound from "./shared/error/page-not-found";
import ProfileRoutes from "./modules/profile";

const AppRoutes = () => {
  return (
    <div className="md:mx-auto max-w-6xl my-6" style={{ minHeight: "600px" }}>
      <div className="mx-3">
        <ErrorBoundaryRoutes>
          <Route index element={<Home />} />
          <Route path="/my-profile/*" element={<ProfileRoutes />} />

          <Route path="/schedule/*" element={<ScheduleRoutes />} />
          <Route path="/requests/*" element={<ModuleTwoRoutes />} />

          <Route path="*" element={<PageNotFound />} />
        </ErrorBoundaryRoutes>
      </div>
    </div>
  );
};

export default AppRoutes;
