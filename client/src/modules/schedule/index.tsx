import { Route, Routes } from "react-router-dom";
import Calendar from "./manager/calendar";
import { GlobalStateContext } from "../../configs/global-state-provider";
import React from "react";

const ScheduleRoutes = () => {
    const globalState = React.useContext(GlobalStateContext).globalState;

    return (
        <Routes>
            <Route path="/" element={
            globalState?.user?.role === 'MANAGER' ? <Calendar /> : null} />
            {/* <Route path="/:id" element={<Schedule />} /> */}
        </Routes>
    );
}

export default ScheduleRoutes;