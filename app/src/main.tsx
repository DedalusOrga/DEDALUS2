import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Startseite from "./pages/Startseite";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Protected from "./components/Protected";
import AdminProtected from "./components/AdminProtected";
import { AuthProvider } from "./hooks/AuthProvider";

import InformationenOverview from "./pages/InformationenOverview";
import TherapieDetail from "./pages/TherapieDetail";
import QuestionsPage from "./pages/QuestionsPage";

import "./index.css";


const router = createBrowserRouter([
  // 🔓 Public Routes (ohne Login)
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/auth/forgot", element: <ForgotPassword /> },
  { path: "/auth/reset", element: <ResetPassword /> },

  // Admin ganz oben – nur geschützt, aber NICHT in der App-Navigation
  {
    path: "/admin",
    element: (
      <AdminProtected>
        <AdminPage />
      </AdminProtected>
    ),
  },

  // 🔐 Alle übrigen Routen nur mit Login erreichbar
  {
    path: "/",
    element: (
      <Protected>
        <App />
      </Protected>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/home", element: <Home /> },

      {
        path: "/entscheidungen",
        element: (
          <div className="p-6 text-lg">Entscheidungen (Platzhalter)</div>
        ),
      },

      { path: "/informationen", element: <InformationenOverview /> },

      { path: "/informationen/:slug", element: <TherapieDetail /> },

      {
        path: "/einstellungen",
        element: <div className="p-6 text-lg">Einstellungen (Platzhalter)</div>,
      },

      { path: "/fragen", element: <QuestionsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
