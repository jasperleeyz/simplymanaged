import { Route, Routes } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import CompanyPage from "./company";

const CompanyManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CompanyPage />} />
            <Route path={`/${PATHS.EDIT_DEPARTMENT}`} element={<CompanyPage />} />
        </Routes>
    );
}

export default CompanyManagementRoutes;