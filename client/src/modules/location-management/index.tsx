import { Route, Routes } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import LocationsPage from "./locations";
import AddOrEditLocation from "./add-or-edit-location";

const LocationManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LocationsPage />} />
            <Route path={`/${PATHS.ADD_LOCATION}`} element={<AddOrEditLocation />} />
            <Route path={`/${PATHS.EDIT_LOCATION}/:id`} element={<AddOrEditLocation />} />
            {/* <Route path={`/${PATHS.VIEW_LOCATION}/:id`} element={<EmployeesViewPage />} /> */}
        </Routes>
    );
}

export default LocationManagementRoutes;