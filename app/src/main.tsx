import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Protected from "./components/Protected";
import { AuthProvider } from "./hooks/AuthProvider";

import InformationenOverview from "./pages/InformationenOverview";
import TherapieDetail from "./pages/TherapieDetail";

import "./index.css";
import QuestionsPage from "./pages/QuestionsPage";

const router = createBrowserRouter([
  // 🔓 Public Routes (ohne Login)
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/auth/forgot", element: <ForgotPassword /> },
  { path: "/auth/reset", element: <ResetPassword /> },

  // 🔐 Alle übrigen Routen nur mit Login erreichbar
  {
    path: "/",
    element: (
      <Protected>
        <App />
      </Protected>
    ),
    children: [
      // Startseite nach Login
      { path: "/", element: <Home /> },
      { path: "/home", element: <Home /> }, // optionaler Alias

      // Entscheidungen – aktuell Platzhalter
      {
        path: "/entscheidungen",
        element: (
          <div className="p-6 text-lg">Entscheidungen (Platzhalter)</div>
        ),
      },

      // Informationen-Übersicht (eigene Seite)
      {
        path: "/informationen",
        element: <InformationenOverview />,
      },

      // Detailseite, erreichbar z.B. über /informationen/strahlentherapie
      {
        path: "/informationen/:slug",
        element: <TherapieDetail />,
      },

      // Einstellungen – derzeit Platzhalter
      {
        path: "/einstellungen",
        element: <div className="p-6 text-lg">Einstellungen (Platzhalter)</div>,
      },

      // Fragen-Seite
      {
        path: "/fragen",
        element: <QuestionsPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
