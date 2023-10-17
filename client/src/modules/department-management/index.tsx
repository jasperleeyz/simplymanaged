import { Route, Routes } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import DepartmentsPage from "./departments";
import AddOrEditDepartment from "./add-or-edit-department";
import DepartmentDetails from "./department-details";

const DepartmentManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DepartmentsPage />} />
            <Route path={`/${PATHS.ADD_DEPARTMENT}`} element={<AddOrEditDepartment />} />
            <Route path={`/${PATHS.EDIT_DEPARTMENT}/:id`} element={<AddOrEditDepartment />} />
            <Route path={`/${PATHS.VIEW_DEPARTMENT}/:id`} element={<DepartmentDetails />} />
        </Routes>
    );
}

export default DepartmentManagementRoutes;