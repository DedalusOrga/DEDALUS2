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
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/auth/forgot", element: <ForgotPassword /> },
      {
        path: "/",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
      },
      { path: "/auth/reset", element: <ResetPassword /> },
      {
        path: "/home",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
        // { path: "/auth/callback", element: <AuthCallback /> },
      }, // ← NEU
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
