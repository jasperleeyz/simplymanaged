import { Route, Routes } from "react-router-dom";
import EmployeesPage from "./employees";
import EmployeesAddPage from "./employees-add";
import EmployeesEditPage from "./employees-edit";
import EmployeesViewPage from "./employees-view"
import { PATHS } from "../../configs/constants";

const SysAdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path={`/${PATHS.ADD_EMPLOYEE}`} element={<EmployeesAddPage />} />
            <Route path={`/${PATHS.EDIT_PROFILE}/:id`} element={<EmployeesEditPage />} />
            <Route path={`/${PATHS.VIEW_EMPLOYEE}/:id`} element={<EmployeesViewPage />} />

        </Routes>
    );
}

export default SysAdminRoutes;