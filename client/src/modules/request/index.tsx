import React from "react";
import { Route, Routes } from "react-router-dom";
import Requests from "./requests";

const RequestRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Requests />} />
      {/* <Route path="/edit" element={<Schedule />} /> */}
    </Routes>
  );
};

export default RequestRoutes;
