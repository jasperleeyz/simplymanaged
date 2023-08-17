import { Route, Routes } from "react-router-dom";
import { GlobalStateContext } from "../../configs/global-state-provider";
import React from "react";
import ProfilePage from "./profile-page";

const ProfileRoutes = () => {
    const globalState = React.useContext(GlobalStateContext).globalState;

    return (
        <Routes>
            <Route path="/" element={<ProfilePage />} />
            {/* <Route path="/edit" element={<Schedule />} /> */}
        </Routes>
    );
}

export default ProfileRoutes;