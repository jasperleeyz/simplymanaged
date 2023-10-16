import { Route, Routes } from "react-router-dom";
import { PATHS } from "../../configs/constants";

const CompanyCodeManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<></>} />
            {/* <Route path={`/${PATHS.ADD_COMPANY_CODE}`} element={<AddOrEditUser />} />
            <Route path={`/${PATHS.EDIT_COMPANY_CODE}/:id`} element={<AddOrEditUser />} />
            <Route path={`/${PATHS.VIEW_COMPANY_CODE}/:id`} element={<EmployeesViewPage />} /> */}
        </Routes>
    );
}

export default CompanyCodeManagementRoutes;