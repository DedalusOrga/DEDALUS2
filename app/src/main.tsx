import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import App from "./App";
import Startseite from "./pages/Startseite";
import AdminPage from "./pages/admin/AdminPage";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { GlossaryProvider } from "./glossary/GlossaryProvider";
import Protected from "./components/Protected";
import AdminProtected from "./components/admin/AdminProtected";
import { AuthProvider } from "./hooks/AuthProvider";

import EntscheidungenOverview from "./pages/Entscheidungen/EntscheidungenOverview";
import FrageboegenEntscheidung from "./pages/Entscheidungen/Frageboegen/FrageboegenEntscheidung";
import FragebogenFrage from "./pages/Entscheidungen/Frageboegen/FragebogenFrage";
import FragebogenFertig from "./pages/Entscheidungen/Frageboegen/FragebogenFertig";

import PlanungOverview from "./pages/Entscheidungen/PlanungOverview";
import PlanungDetail from "./pages/Entscheidungen/PlanungDetail";

import ArztgespraechOverview from "./pages/Entscheidungen/ArztgespraechOverview";
import ArztgespraechDetail from "./pages/Entscheidungen/ArztgespraechDetail";

import OptionenTherapie from "./pages/Informationen/OptionenTherapie";
import TherapieDetail from "./pages/Informationen/TherapieDetail";
import QuestionsPage from "./pages/QuestionsPage";
import InformationOverview from "./pages/Informationen/InformationOverview";

import KrebsinformationenOverview from "./pages/Informationen/KrebsinformationenOverview";
import KrebsinformationenDetail from "./pages/Informationen/KrebsinformationenDetail";

import NebenwirkungenOverview from "./pages/Informationen/NebenwirkungenOverview";
import NebenwirkungenDetail from "./pages/Informationen/NebenwirkungenDetail";
import UmgangNebenwirkungenDetail from "./pages/Informationen/UmgangNebenwirkungenDetail";

import PatientenPerspektiveOverview from "./pages/Informationen/PatientenPerspektiveOverview";
import PatientenVideosDetail from "./pages/Informationen/PatientenVideosDetail";
import PatientenNeueInhalteDetail from "./pages/PatientenNeueInhalteDetail";

import ZusatzoptionenOverview from "./pages/Informationen/ZusatzoptionenOverview";
import ZusatzoptionenDetail from "./pages/Informationen/ZusatzoptionenDetail";

import UnterstuetzungsangeboteOverview from "./pages/Informationen/UnterstuetzungsangeboteOverview";
import UnterstuetzungsangeboteDetail from "./pages/Informationen/UnterstuetzungsangeboteDetail";

import WeiterfuehrendeInfoOverview from "./pages/Informationen/WeiterfuehrendeInfoOverview";
import WeiterfuehrendeInfoDetail from "./pages/Informationen/WeiterfuehrendeInfoDetail";

import AdminDecisionTrees from "./pages/admin/AdminDecisionTrees";
import AdminQuestionsPage from "./pages/admin/AdminQuestionsPage";
import FragebogenErgebnis from "./pages/Entscheidungen/Frageboegen/FragebogenErgebnis";

import AdminGlossary from "./pages/admin/AdminGlossary";
import AdminAllowedEmails from "./pages/admin/AdminAllowedEmails";
import AdminCards from "./pages/admin/AdminCards";
import AdminRecommendationsPage from "./pages/admin/AdminRecommendationPage";

// Basename sauber aus Vite ziehen (z.B. "/" lokal, "/DEDALUS2/" in Prod)
const basename = import.meta.env.BASE_URL ?? "/";

const router = createBrowserRouter(
  [
    // 🔓 Public Routes (ohne Login)
    { path: "/", element: <Startseite /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/auth/forgot", element: <ForgotPassword /> },
    { path: "/auth/reset", element: <ResetPassword /> },

    // 🔒 Admin (separat)
    {
      path: "/admin",
      element: (
        <AdminProtected>
          <AdminPage />
        </AdminProtected>
      ),
    },
    {
      path: "/admin/decision-trees",
      element: (
        <AdminProtected>
          <AdminDecisionTrees />
        </AdminProtected>
      ),
    },
    {
      path: "/admin/recommendations",
      element: (
        <AdminProtected>
          <AdminRecommendationsPage />
        </AdminProtected>
      ),
    },

    {
      path: "/admin/questions",
      element: (
        <AdminProtected>
          <AdminQuestionsPage />
        </AdminProtected>
      ),
    },
    {
      path: "/admin/glossary",
      element: (
        <AdminProtected>
          <AdminGlossary />
        </AdminProtected>
      ),
    },
    {
      path: "/admin/whitelist",
      element: (
        <AdminProtected>
          <AdminAllowedEmails />
        </AdminProtected>
      ),
    },
    {
      path: "/admin/cards",
      element: (
        <AdminProtected>
          <AdminCards />
        </AdminProtected>
      ),
    },

    // 🔐 App-Bereich (alles darunter geschützt)
    {
      path: "/",
      element: (
        <Protected>
          <GlossaryProvider>
            <App />
          </GlossaryProvider>
        </Protected>
      ),
      children: [
        { path: "home", element: <Home /> },

        { path: "entscheidungen", element: <EntscheidungenOverview /> },

        {
          path: "entscheidungen/arztgespraech",
          element: <ArztgespraechOverview />,
        },
        {
          path: "entscheidungen/arztgespraech/:slug",
          element: <ArztgespraechDetail />,
        },

        {
          path: "entscheidungen/frageboegen",
          element: <FrageboegenEntscheidung />,
        },
        { path: "entscheidungen/fragebogen/:id", element: <FragebogenFrage /> },
        {
          path: "entscheidungen/fragebogen/:id/fertig",
          element: <FragebogenFertig />,
        },
        {
          path: "entscheidungen/fragebogen/:id/ergebnis",
          element: <FragebogenErgebnis />,
        },

        {
          path: "entscheidungen/planung",
          element: <PlanungOverview />,
        },

        {
          path: "entscheidungen/planung/:slug",
          element: <PlanungDetail />,
        },

        // Infos / Therapie
        { path: "informationen-uebersicht", element: <InformationOverview /> },
        {
          path: "informationen/optionentherapie",
          element: <OptionenTherapie />,
        },
        { path: "informationen/:slug", element: <TherapieDetail /> },

        // Sonstiges
        {
          path: "einstellungen",
          element: (
            <div className="p-6 text-lg">Einstellungen (Platzhalter)</div>
          ),
        },
        { path: "fragen", element: <QuestionsPage /> },

        // Krebsinformationen
        {
          path: "informationen/allgemein",
          element: <KrebsinformationenOverview />,
        },
        {
          path: "informationen/allgemein/:slug",
          element: <KrebsinformationenDetail />,
        },

        // Nebenwirkungen
        {
          path: "informationen/nebenwirkungen",
          element: <NebenwirkungenOverview />,
        },
        {
          path: "informationen/nebenwirkungen/nebenwirkungen-detail",
          element: <NebenwirkungenDetail />,
        },
        {
          path: "informationen/nebenwirkungen/umgang-nebenwirkungen",
          element: <UmgangNebenwirkungenDetail />,
        },

        // Patientenperspektive
        {
          path: "informationen/patientenperspektive",
          element: <PatientenPerspektiveOverview />,
        },
        {
          path: "/informationen/patientenperspektive/:slug",
          element: <PatientenVideosDetail />,
        },
        {
          path: "informationen/patientenperspektive/neue-inhalte",
          element: <PatientenNeueInhalteDetail />,
        },

        // Zusatzoptionen
        {
          path: "informationen/zusaetzlich",
          element: <ZusatzoptionenOverview />,
        },
        {
          path: "informationen/zusaetzlich/:slug",
          element: <ZusatzoptionenDetail />,
        },

        // Unterstützungsangebote
        {
          path: "informationen/unterstuetzung",
          element: <UnterstuetzungsangeboteOverview />,
        },
        {
          path: "informationen/unterstuetzung/:slug",
          element: <UnterstuetzungsangeboteDetail />,
        },

        // Weiterführende Infos
        {
          path: "informationen/weiter",
          element: <WeiterfuehrendeInfoOverview />,
        },
        {
          path: "informationen/weiter/:slug",
          element: <WeiterfuehrendeInfoDetail />,
        },
        {
          path: "glossary",
          element: <AdminGlossary />,
        },
      ],
    },
  ],
  { basename },
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
