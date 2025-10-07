// src/main.jsx (o src/index.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "./Pages/Login";
import RegisterPage from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import ClientsPage from "./Pages/Clients";
import OrdersPage from "./Pages/Orders";
import "./index.css";

function Protected({ children }) {
  const session = localStorage.getItem("gd_session");
  return session ? children : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/app", element: <Protected><Dashboard /></Protected> },
  { path: "/clients", element: <Protected><ClientsPage /></Protected> },
  { path: "/orders", element: <Protected><OrdersPage /></Protected> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
