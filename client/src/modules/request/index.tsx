"use client";

import React from "react";
import { Route, Routes } from "react-router-dom";
import Requests from "./requests";
import { PATHS } from "../../configs/constants";
import RequestDetails from "./request-details";
import AddOrEditRequest from "./add-edit-request";
import PersonalRequestDetails from "./personal-request-details";

const RequestRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Requests />} />
      <Route path={`/${PATHS.VIEW_REQUEST}/personal/:id`} element={<PersonalRequestDetails />} />
      <Route path={`/${PATHS.VIEW_REQUEST}/:id`} element={<RequestDetails />} />
      <Route path={`/${PATHS.ADD_REQUEST}`} element={<AddOrEditRequest />} />
    </Routes>
  );
};

export default RequestRoutes;
