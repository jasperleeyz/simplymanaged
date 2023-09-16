import { Route, Routes } from "react-router-dom";
import EmployeesPage from "./employees";
import { PATHS } from "../../configs/constants";

const SysAdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path={`/${PATHS.ADD_EMPLOYEE}`} element={<EmployeesPage/>} />
            <Route path={`/${PATHS.EDIT_PROFILE}`} element={<EmployeesPage/>} />

        </Routes>
    );
}

export default SysAdminRoutes;