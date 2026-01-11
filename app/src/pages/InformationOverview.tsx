import { useNavigate } from "react-router-dom";

// Deine Figma SVGs (GENAU wie du sie genannt hast)
import BookIcon from "../assets/icons/book.svg";
import HeartIcon from "../assets/icons/heart.svg";
import SideIcon from "../assets/icons/side.svg";
import PatientIcon from "../assets/icons/patient.svg";
import LensIcon from "../assets/icons/lens.svg";
import HandshakeIcon from "../assets/icons/handshake.svg";
import InfoIcon from "../assets/icons/info.svg";

type InfoCard = {
  id: string;
  title: string;
  icon: string;
  slug: string | null;
};

const cards: InfoCard[] = [
  {
    id: "krebs",
    title: "allgemeine Krebsinformationen",
    icon: BookIcon,
    slug: "allgemein",
  },
  {
    id: "therapie",
    title: "Therapieoptionen",
    icon: HeartIcon,
    slug: "optionentherapie",
  },
  {
    id: "nebenwirkungen",
    title: "Nebenwirkungs-management",
    icon: SideIcon,
    slug: "nebenwirkungen",
  },
  {
    id: "patienten",
    title: "Patient*innen-perspektive",
    icon: PatientIcon,
    slug: "patientenperspektive",
  },
  {
    id: "zusaetzlich",
    title: "zusätzliche Therapieoptionen",
    icon: LensIcon,
    slug: "zusaetzlich",
  },
  {
    id: "support",
    title: "Unterstützungs-angebote",
    icon: HandshakeIcon,
    slug: "unterstuetzung",
  },
  {
    id: "weiterfuehrende",
    title: "weiterführende Informationen",
    icon: InfoIcon,
    slug: "weiter",
  },
];

export default function InformationOverview() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
      {/* Titel – wird auf größeren Displays größer */}
      <h1 className="mb-8 text-2xl font-extrabold text-emerald-900 sm:text-3xl md:text-4xl md:mb-10">
        Informationen
      </h1>

      {/* Responsive Grid:
          Handy → 1 Spalte
          Tablet → 2 Spalten
          Desktop → 3 Spalten */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => card.slug && navigate(`/informationen/${card.slug}`)}
            disabled={!card.slug}
            className={`
              flex h-full w-full flex-col items-start rounded-2xl bg-white p-5 text-left shadow-sm
              transition focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2

              ${
                card.slug
                  ? "cursor-pointer hover:bg-emerald-50 hover:shadow-md"
                  : "cursor-default opacity-60"
              }
            `}
          >
            {/* Icon: responsiv für Tablets/Handys */}
            <img
              src={card.icon}
              alt=""
              className="mb-4 h-10 w-10 sm:h-12 sm:w-12"
            />

            {/* Titel: responsiv */}
            <span className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
              {card.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
