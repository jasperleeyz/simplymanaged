import { Route, Routes } from "react-router-dom";
import AddOrEditCode from "./add-or-edit-code";
import { PATHS } from "../../configs/constants";

const CodeManagementRoutes = () => {
    return (
        <Routes>
            {/* <Route path="/" element={<CodeManagement />} /> */}
            <Route path={`/${PATHS.ADD_CODE}`} element={<AddOrEditCode />} />
            <Route path={`/${PATHS.EDIT_CODE}`} element={<AddOrEditCode />} />
            <Route path={`/${PATHS.VIEW_CODE}`} element={<></>} />
        </Routes>
    );
}

export default CodeManagementRoutes;