import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalStateProvider from "./configs/global-state-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalStateProvider>
      <ToastContainer hideProgressBar={true} autoClose={2000} pauseOnHover={false} theme={"light"}/>
      <App />
    </GlobalStateProvider>
  </React.StrictMode>
);
