// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";

// Auth / Core Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Protected from "./components/Protected";

// Neue Seiten (Informationen)
import InformationenOverview from "./pages/InformationenOverview";
import TherapieDetail from "./pages/TherapieDetail";

// Router-Konfiguration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Öffentliche Routen
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/auth/reset", element: <ResetPassword /> },

      // Geschützte Routen
      {
        path: "/",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
      },
      {
        path: "/home",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
      },
      {
        path: "/informationen",
        element: (
          <Protected>
            <InformationenOverview />
          </Protected>
        ),
      },
      {
        path: "/informationen/:slug",
        element: (
          <Protected>
            <TherapieDetail />
          </Protected>
        ),
      },
    ],
  },
]);

// Render
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
