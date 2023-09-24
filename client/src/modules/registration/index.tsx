import { Route, Routes } from "react-router-dom";
import RegistrationForm from "./registration-form";

const RegistrationRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RegistrationForm />} />
        </Routes>
    );
}

export default RegistrationRoutes;