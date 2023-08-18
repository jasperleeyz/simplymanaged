import React from "react";
import ErrorBoundaryRoutes from "./shared/error/error-boundary-routes";
import { Route } from "react-router-dom";
import Home from "./modules/home/home";
import ScheduleRoutes from "./modules/schedule";
import RequestRoutes from "./modules/request";
import PageNotFound from "./shared/error/page-not-found";
import ProfileRoutes from "./modules/profile";
import { PATHS } from "./configs/constants";

const AppRoutes = () => {
  return (
    <div className="md:mx-auto max-w-6xl my-6" style={{ minHeight: "600px" }}>
      <div className="mx-3">
        <ErrorBoundaryRoutes>
          <Route index element={<Home />} />
          <Route path={`/${PATHS.MY_PROFILE}/*`} element={<ProfileRoutes />} />

          <Route path={`/${PATHS.SCHEDULE}/*`} element={<ScheduleRoutes />} />
          <Route path={`/${PATHS.REQUESTS}/*`} element={<RequestRoutes />} />

          <Route path="*" element={<PageNotFound />} />
        </ErrorBoundaryRoutes>
      </div>
    </div>
  );
};

export default AppRoutes;
