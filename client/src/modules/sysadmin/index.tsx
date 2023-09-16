import { Route, Routes } from "react-router-dom";
import EmployeesPage from "./employees";
import EmployeesAddPage from "./employees-add";
import EmployeesEditPage from "./employees-edit";
import { PATHS } from "../../configs/constants";

const SysAdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path={`/${PATHS.ADD_EMPLOYEE}`} element={<EmployeesAddPage/>} />
            <Route path={`/${PATHS.EDIT_PROFILE}`} element={<EmployeesEditPage/>} />

        </Routes>
    );
}

export default SysAdminRoutes;