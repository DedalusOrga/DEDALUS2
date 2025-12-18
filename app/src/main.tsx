import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Startseite from "./pages/Startseite";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import EntscheidungenOverview from "./pages/EntscheidungenOverview";
import FrageboegenEntscheidung from "./pages/FrageboegenEntscheidung";
import FragebogenFrage from "./pages/FragebogenFrage";
import FragebogenFertig from "./pages/FragebogenFertig";
import ForgotPassword from "./pages/ForgotPassword";
import Protected from "./components/Protected";
import AdminProtected from "./components/AdminProtected";
import { AuthProvider } from "./hooks/AuthProvider";



import ArztgespraechOverview from "./pages/ArztgespraechOverview";
import OptionenTherapie from "./pages/OptionenTherapie";
import TherapieDetail from "./pages/TherapieDetail";
import QuestionsPage from "./pages/QuestionsPage";
import InformationOverview from "./pages/InformationOverview";
import KrebsinformationenOverview from "./pages/KrebsinformationenOverview";
import KrebsinformationenDetail from "./pages/KrebsinformationenDetail";
import NebenwirkungenOverview from "./pages/NebenwirkungenOverview";
import NebenwirkungenDetail from "./pages/NebenwirkungenDetail";
import UmgangNebenwirkungenDetail from "./pages/UmgangNebenwirkungenDetail";
import PatientenPerspektiveOverview from "./pages/PatientenPerspektiveOverview";
import PatientenVideosDetail from "./pages/PatientenVideosDetail";
import ZusatzoptionenOverview from "./pages/ZusatzoptionenOverview";
import ZusatzoptionenDetail from "./pages/ZusatzoptionenDetail";
import PatientenNeueInhalteDetail from "./pages/PatientenNeueInhalteDetail";
import UnterstuetzungsangeboteOverview from "./pages/UnterstuetzungsangeboteOverview";
import UnterstuetzungsangeboteDetail from "./pages/UnterstuetzungsangeboteDetail";
import WeiterfuehrendeInfoOverview from "./pages/WeiterfuehrendeInfoOverview";
import WeiterfuehrendeInfoDetail from "./pages/WeiterfuehrendeInfoDetail";
import "./index.css";

const basename = import.meta.env.DEV ? "/" : "/DEDALUS2";

const router = createBrowserRouter([
  // 🔓 Public Routes (ohne Login)
  { path: "/", element: <Startseite /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/auth/forgot", element: <ForgotPassword /> },

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
    path: "/app",
    element: (
      <Protected>
        <App />
      </Protected>
    ),
    children: [
      { index: true, element: <Home /> },

      { path: "entscheidungen", element: <EntscheidungenOverview /> },

      { path: "entscheidungen/arztgespraech", element: <ArztgespraechOverview /> },

      { path: "entscheidungen/frageboegen-entscheidung", element: <FrageboegenEntscheidung /> },

      { path: "entscheidungen/fragebogen/:id", element: <FragebogenFrage /> },

      { path: "entscheidungen/fragebogen/:id/fertig", element: <FragebogenFertig /> },


      {
      path: "informationen/optionentherapie",
      element: <OptionenTherapie />,
      },

      { path: "informationen/:slug", element: <TherapieDetail /> },

      {
        path: "einstellungen",
        element: <div className="p-6 text-lg">Einstellungen (Platzhalter)</div>,
      },
      
      {
       path: "fragen",
       element: <QuestionsPage />,
      },
// -------------------------------------------
// 📌 INFORMATIONEN → ÜBERSICHTSSEITE
// (7 Kacheln: allgemeine Krebsinformationen,
//  Therapieoptionen, Nebenwirkungsmanagement,
//  Patient*innen-Perspektive, zusätzliche Therapien,
//  Unterstützungsangebote, weiterführende Infos)
// -------------------------------------------
  {
      path: "informationen-uebersicht",
      element: <InformationOverview />,
},
  // -------------------------------------------
  // 📌 KREBS-INFORMATIONEN -> ZWISCHENÜBERSICHT
  // (2 Kacheln: Stadienübersicht + Stadium III vs. IV)
  // -------------------------------------------
{
  path: "informationen/allgemein",
  element: <KrebsinformationenOverview />,
},
// -------------------------------------------
    // 📌 KREBS-INFORMATIONEN -> DETAILSEITEN
    // /informationen/allgemein/stadienuebersicht
    // /informationen/allgemein/stadium-vergleich
    // -------------------------------------------
{
  path: "informationen/allgemein/:slug",
  element: <KrebsinformationenDetail />,
},
// -------------------------------------------
// 📌 INFORMATIONEN → NEBENWIRKUNGSMANAGEMENT (Übersicht)
// Zeigt die 2 Kacheln: Nebenwirkungen / Umgang mit Nebenwirkungen
// -------------------------------------------
{
  path: "informationen/nebenwirkungen",
  element: <NebenwirkungenOverview />,
},

// -------------------------------------------
// 📌 INFORMATIONEN → NEBENWIRKUNGEN DETAIL
// -------------------------------------------
{
  path: "informationen/nebenwirkungen/nebenwirkungen-detail",
  element: <NebenwirkungenDetail />,
},

// -------------------------------------------
// 📌 INFORMATIONEN → UMGANG MIT NEBENWIRKUNGEN DETAIL
// -------------------------------------------
{
  path: "informationen/nebenwirkungen/umgang-nebenwirkungen",
  element: <UmgangNebenwirkungenDetail />,
},
// -------------------------------------------
// 📌 INFORMATIONEN → PATIENT*INNEN-PERSPEKTIVE (Übersicht)
// 2 Kacheln: Videos/Audios & neue Inhalte (Platzhalter)
// -------------------------------------------
{
  path: "informationen/patientenperspektive",
  element: <PatientenPerspektiveOverview />,
},

// -------------------------------------------
// 📌 PATIENT*INNEN-PERSPEKTIVE → Videos/Audios
// -------------------------------------------
{
  path: "informationen/patientenperspektive/videos-audios",
  element: <PatientenVideosDetail />,
},

// -------------------------------------------
// 📌 PATIENT*INNEN-PERSPEKTIVE → neue Inhalte (Platzhalter)
// -------------------------------------------
{
  path: "informationen/patientenperspektive/neue-inhalte",
  element: <PatientenNeueInhalteDetail />,
},
// -------------------------------------------
// 📌 INFORMATIONEN → ZUSÄTZLICHE THERAPIEOPTIONEN (Übersicht)
// -------------------------------------------
{
  path: "informationen/zusaetzlich",
  element: <ZusatzoptionenOverview />,
},

// -------------------------------------------
// 📌 INFORMATIONEN → ZUSÄTZLICHE THERAPIEOPTIONEN (Details)
// -------------------------------------------
{
  path: "informationen/zusaetzlich/:slug",
  element: <ZusatzoptionenDetail />,
},
// -------------------------------------------
// 📌 INFORMATIONEN → UNTERSTÜTZUNGSANGEBOTE (Übersicht)
// -------------------------------------------
{
  path: "informationen/unterstuetzung",
  element: <UnterstuetzungsangeboteOverview />,
},

// -------------------------------------------
// 📌 INFORMATIONEN → UNTERSTÜTZUNGSANGEBOTE (Details)
// Beispiel-URLs:
// /informationen/unterstuetzung/sozialdienst
// /informationen/unterstuetzung/selbsthilfegruppen
// -------------------------------------------
{
  path: "informationen/unterstuetzung/:slug",
  element: <UnterstuetzungsangeboteDetail />,
},
// -------------------------------------------
// 📌 INFORMATIONEN → WEITERFÜHRENDE INFORMATIONEN (Übersicht)
// -------------------------------------------
{
  path: "informationen/weiter",
  element: <WeiterfuehrendeInfoOverview />,
},

// -------------------------------------------
// 📌 INFORMATIONEN → WEITERFÜHRENDE INFORMATIONEN (Details)
// -------------------------------------------
{
  path: "informationen/weiter/:slug",
  element: <WeiterfuehrendeInfoDetail />,
},




    ],
  },
],
  {
    basename,
  }
);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
