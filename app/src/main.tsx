import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Protected from "./components/Protected";
import { AuthProvider } from "./hooks/AuthProvider";

import InformationenOverview from "./pages/InformationenOverview";
import TherapieDetail from "./pages/TherapieDetail";

import "./index.css";

const router = createBrowserRouter([

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/auth/reset", element: <ResetPassword /> },

  {
    path: "/",
    element: (
      <Protected>
        <App />
      </Protected>
    ),
    children: [
      { index: true, element: <Home /> }, 
      { path: "home", element: <Home /> },
      { path: "informationen", element: <InformationenOverview /> },
      { path: "informationen/:slug", element: <TherapieDetail /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
