import { Route, Routes } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import CompanyCodes from "./company-codes";
import AddOrEditCompanyCode from "./add-or-edit-company-code";
import CompanyCodeDetails from "./company-code-details";

const CompanyCodeManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CompanyCodes />} />
            <Route path={`/${PATHS.ADD_COMPANY_CODE}`} element={<AddOrEditCompanyCode />} />
            <Route path={`/${PATHS.EDIT_COMPANY_CODE}/:id`} element={<AddOrEditCompanyCode />} />
            <Route path={`/${PATHS.VIEW_COMPANY_CODE}/:id`} element={<CompanyCodeDetails />} />
        </Routes>
    );
}

export default CompanyCodeManagementRoutes;