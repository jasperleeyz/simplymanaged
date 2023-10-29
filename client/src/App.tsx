import "./App.css";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./shared/error/error-boundary";
import AppRoutes from "./routes";
import Footer from "./shared/layout/footer/footer";
import Header from "./shared/layout/header/header";
import React from "react";
import { GlobalStateContext, InitialGlobalState } from "./configs/global-state-provider";
import "./configs/fetch-interceptor.js";

function App() {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const isAuthenticated = globalState?.isAuthenticated;

  React.useEffect(() => {
    // check authenticationStatus
    // if authenticated, then retrieve necessary details from backend
    // and populate into global state (eg. list of schedule templates)
    const bearerToken = sessionStorage.getItem("bearerToken");
    if(bearerToken) {
      fetch(`/user/info`, {
        method: "GET",
      }).then((res) => {
        if (res.status === 200) {
          return res.json().then((data) => {
            setGlobalState((prevState) => ({
              ...prevState,
              isAuthenticated: true,
              user: {...prevState.user, ...data.user},
              sessionFetched: true,
            }));
          });
        }
        else if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem("bearerToken");
          setGlobalState((prevState) => InitialGlobalState);
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        sessionStorage.removeItem("bearerToken");
        setGlobalState((prevState) => InitialGlobalState);
        window.location.href = "/login";
      });
    } else {
      setGlobalState((prevState) => ({
        ...prevState,
        isAuthenticated: false,
        sessionFetched: true,
      }));
    }
    
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
