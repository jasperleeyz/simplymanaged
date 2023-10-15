import { Route, Routes } from "react-router-dom";
import EmployeesPage from "./employees";
import EmployeesViewPage from "./employees-view"
import { PATHS } from "../../configs/constants";
import AddOrEditUser from "./employees-add-or-edit";

const EmployeeManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path={`/${PATHS.ADD_EMPLOYEE}`} element={<AddOrEditUser />} />
            <Route path={`/${PATHS.EDIT_PROFILE}/:id`} element={<AddOrEditUser />} />
            <Route path={`/${PATHS.VIEW_EMPLOYEE}/:id`} element={<EmployeesViewPage />} />
        </Routes>
    );
}

export default EmployeeManagementRoutes;