import { Route, Routes } from "react-router-dom";
import PeoplePage from "./people";
import { PATHS } from "../../configs/constants";

const PeopleRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PeoplePage />} />
            <Route path={`/${PATHS.ADD_EMPLOYEE}`} element={<PeoplePage/>} />
            <Route path={`/${PATHS.EDIT_PROFILE}`} element={<PeoplePage/>} />

        </Routes>
    );
}

export default PeopleRoutes;