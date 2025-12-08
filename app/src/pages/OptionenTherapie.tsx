import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SunIcon from "../assets/sun.svg";
import SyringeIcon from "../assets/syringe.svg";
import HospitalIcon from "../assets/hospital.svg";
import ShieldIcon from "../assets/shield.svg";
import TargetIcon from "../assets/target.svg";
import LeafIcon from "../assets/leaf.svg";
import ArrowRight from "../assets/arrowRight.svg";
import ArrowLeft from "../assets/arrowLeft.svg";
import PlayIcon from "../assets/play.svg";


type Therapy = {
  id: string;
  name: string;
  icon: string;
  slug: string;
};

const page1: Therapy[] = [
  { id: "immun", name: "Immuntherapie", icon: ShieldIcon, slug: "immuntherapie" },
  { id: "strahlen", name: "Strahlentherapie", icon: SunIcon, slug: "strahlentherapie" },
  { id: "chemo", name: "Chemotherapie", icon: SyringeIcon, slug: "chemotherapie" },
];

const page2: Therapy[] = [
  { id: "op", name: "Operationen", icon: HospitalIcon, slug: "operationen" },
  { id: "target", name: "zielgerichtete Therapie", icon: TargetIcon, slug: "zielgerichtete-therapie" },
  { id: "palliativ", name: "Palliativmedizin", icon: LeafIcon, slug: "palliativmedizin" },
];

export default function InformationenOverview() {
  const [page, setPage] = useState<0 | 1>(0); // 0 = erste 3, 1 = zweite 3
  const navigate = useNavigate();

  const therapies = page === 0 ? page1 : page2;

  const handleCardClick = (slug: string) => {
    navigate(`/informationen/${slug}`);
  };

  const togglePage = () => {
    setPage((prev) => (prev === 0 ? 1 : 0));
  };

  return (
  <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      
      {/* Zurück oben */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
      >
        <span className="text-2xl mr-2">←</span>
        Zurück
      </button>

      {/* Titel */}
      <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950 mb-10">
        Hier finden Sie verständliche Informationen zu verschiedenen Therapien.
      </h1>

      {/* Karten + Pfeile nebeneinander */}
      <div className="relative mb-16">

        {/* Grid mit 3 Karten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapies.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.slug)}
              className="bg-white rounded-3xl shadow-sm h-64 flex flex-col items-center justify-center 
                         hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="mb-3">
                <img src={card.icon} alt={card.name} className="w-12 h-12 mb-3 text-emerald-900" />
              </div>
              <div className="text-lg font-medium text-emerald-900 text-center">
                {card.name}
              </div>
            </button>
          ))}
        </div>

        {/* Pfeil links (nur Seite 2) */}
        {page === 1 && (
          <button
            onClick={togglePage}
            className="absolute top-1/2 left-[-4rem] -translate-y-1/2 flex items-center justify-center 
                       w-16 h-16 border-emerald-800 text-3xl text-emerald-900 
                       hover:bg-emerald-100 transition"
            aria-label="Zu vorherigen Therapien zurück"
          >
            <img src={ArrowLeft} alt="Zurück" className="w-10 h-10" />
          </button>
        )}

        {/* Pfeil rechts (nur Seite 1) */}
        {page === 0 && (
          <button
            onClick={togglePage}
            className="absolute top-1/2 right-[-4rem] -translate-y-1/2 flex items-center justify-center 
                       w-16 h-16 border-emerald-800 text-3xl text-emerald-900 
                       hover:bg-emerald-100 transition"
            aria-label="Weitere Therapien anzeigen"
          >
            <img src={ArrowRight} alt="Weiter" className="w-10 h-10" />
          </button>
        )}

      </div>

      {/* Videos Button */}
      <div className="w-full flex items-center justify-end mt-4 gap-6">
        <button
          onClick={() => navigate("/videos")} // Route musst du noch anlegen
          className="flex items-center bg-emerald-800 hover:bg-emerald-900 text-white 
                     font-semibold px-6 py-3 rounded-full text-lg shadow-md"
        >
          <img src={PlayIcon} alt="Zu den Videos" className="w-5 h-5 mr-2" /> Zu den Videos 
        </button>
      </div>

    </div>
  </div>
)};

