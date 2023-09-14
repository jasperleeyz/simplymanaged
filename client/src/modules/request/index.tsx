"use client";

import React from "react";
import { Route, Routes } from "react-router-dom";
import Requests from "./requests";
import { PATHS } from "../../configs/constants";
import RequestDetails from "./request-details";

const RequestRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Requests />} />
      <Route path={`/${PATHS.VIEW_REQUEST}`} element={<RequestDetails />} />
    </Routes>
  );
};

export default RequestRoutes;
