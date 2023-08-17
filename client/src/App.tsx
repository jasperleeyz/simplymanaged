import "./App.css";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./shared/error/error-boundary";
import AppRoutes from "./routes";
import Footer from "./shared/layout/footer/footer";
import Header from "./shared/layout/header/header";
import GlobalStateProvider from "./configs/global-state-provider";

function App() {
  return (
    <>
      <GlobalStateProvider>
        <BrowserRouter basename="/">
          <ErrorBoundary>
            <Header />
          </ErrorBoundary>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Footer />
        </BrowserRouter>
      </GlobalStateProvider>
    </>
  );
}

export default App;
