import { Route, Routes } from "react-router-dom";
import { PATHS } from "../../configs/constants";

const LocationManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<></>} />
            {/* <Route path={`/${PATHS.ADD_LOCATION}`} element={<AddOrEditUser />} />
            <Route path={`/${PATHS.EDIT_LOCATION}/:id`} element={<AddOrEditUser />} />
            <Route path={`/${PATHS.VIEW_LOCATION}/:id`} element={<EmployeesViewPage />} /> */}
        </Routes>
    );
}

export default LocationManagementRoutes;