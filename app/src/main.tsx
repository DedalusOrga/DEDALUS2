import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Protected from "./components/Protected";
import { AuthProvider } from "./hooks/AuthProvider";   // ⬅️ import
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/", element: <Protected><Home /></Protected> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>                                   {/* ⬅️ wrap hier */}
    <RouterProvider router={router} />
  </AuthProvider>
);
