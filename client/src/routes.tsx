import React from "react";
import ErrorBoundaryRoutes from "./shared/error/error-boundary-routes";
import { Route } from "react-router-dom";
import Home from "./modules/home/home";
import ModuleOneRoutes from "./modules/module-one";
import ModuleTwoRoutes from "./modules/module-two";
import PageNotFound from "./shared/error/page-not-found";

const AppRoutes = () => {
  return (
    <div className="m-3" style={{ minHeight: '600px'}}>
      <ErrorBoundaryRoutes>
        <Route index element={<Home />} />

        <Route path="/module-one" element={<ModuleOneRoutes />} />
        <Route path="/module-two" element={<ModuleTwoRoutes />} />

        <Route path="*" element={<PageNotFound />} />
      </ErrorBoundaryRoutes>
    </div>
  );
};

export default AppRoutes;
