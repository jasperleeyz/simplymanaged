import "./App.css";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./shared/error/error-boundary";
import AppRoutes from "./routes";
import Footer from "./shared/layout/footer/footer";
import Header from "./shared/layout/header/header";
import React from "react";
import { GlobalStateContext } from "./configs/global-state-provider";

function App() {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const isAuthenticated = globalState?.isAuthenticated;

  React.useEffect(() => {
    // TODO: check authenticationStatus
    // if authenticated, then retrieve necessary details from backend
    // and populate into global state (eg. list of schedule templates)
  }, []);

  return (
    <>
      <BrowserRouter basename="/">
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        {/* <Footer /> */}
      </BrowserRouter>
    </>
  );
}

export default App;
