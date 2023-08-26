import { Route, Routes } from "react-router-dom";
import { GlobalStateContext } from "../../configs/global-state-provider";
import React from "react";
import ProfilePage from "./profile-page";
import { PATHS } from "../../configs/constants";

const ProfileRoutes = () => {
    const globalState = React.useContext(GlobalStateContext).globalState;

    return (
        <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path={`/${PATHS.EDIT_PROFILE}`} element={<ProfilePage />} />
        </Routes>
    );
}

export default ProfileRoutes;