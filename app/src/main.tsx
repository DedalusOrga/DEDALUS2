import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Protected from "./components/Protected";
import { AuthProvider } from "./hooks/AuthProvider";
import "./index.css";
import QuestionsPage from "./pages/QuestionsPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
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

     // 🔽🔽🔽 AB HIER NUR NEU 🔽🔽🔽 Anastasia
      {
        path: "/entscheidungen",
        element: (
          <Protected>
            <div className="p-6 text-lg">Entscheidungen (Platzhalter)</div>
          </Protected>
        ),
      },
      {
        path: "/informationen",
        element: (
          <Protected>
            <div className="p-6 text-lg">Informationen (Platzhalter)</div>
          </Protected>
        ),
      },
      {
        path: "/einstellungen",
        element: (
          <Protected>
            <div className="p-6 text-lg">Einstellungen (Platzhalter)</div>
          </Protected>
        ),
      },
      {
        path: "/fragen",
        element: (
          <Protected>
            <QuestionsPage />
          </Protected>
  ),
},

      // 🔼🔼🔼 NUR HINZUGEFÜGT 🔼🔼🔼
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
