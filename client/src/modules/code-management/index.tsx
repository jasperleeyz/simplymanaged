import { Route, Routes } from "react-router-dom";
import AddOrEditCode from "./add-or-edit-code";
import { PATHS } from "../../configs/constants";
import ViewCode from "./view-code";
import CodeDetails from "./code-details";

const CodeManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ViewCode />} />
            <Route path={`/${PATHS.ADD_CODE}`} element={<AddOrEditCode />} />
            <Route path={`/${PATHS.EDIT_CODE}/:id`} element={<AddOrEditCode />} />
            <Route path={`/${PATHS.VIEW_CODE}/:id`} element={<CodeDetails />} />
        </Routes>
    );
}

export default CodeManagementRoutes;