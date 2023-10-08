import { Route, Routes } from "react-router-dom";
import AddOrEditCode from "./add-or-edit-code";
import { PATHS } from "../../configs/constants";
import ViewCode from "./view-code";

const CodeManagementRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ViewCode />} />
            <Route path={`/${PATHS.ADD_CODE}`} element={<AddOrEditCode />} />
            <Route path={`/${PATHS.EDIT_CODE}`} element={<AddOrEditCode />} />
            <Route path={`/${PATHS.VIEW_CODE}`} element={<></>} />
        </Routes>
    );
}

export default CodeManagementRoutes;