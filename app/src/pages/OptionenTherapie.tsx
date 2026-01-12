import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import SunIcon from "../assets/sun.svg";
import SyringeIcon from "../assets/syringe.svg";
import HospitalIcon from "../assets/hospital.svg";
import ShieldIcon from "../assets/shield.svg";
import TargetIcon from "../assets/target.svg";
import LeafIcon from "../assets/leaf.svg";
import PlayIcon from "../assets/play.svg";

type Therapy = {
  id: string;
  name: string;
  icon: string;
  slug: string;
};

const THERAPIES: Therapy[] = [
  {
    id: "immun",
    name: "Immuntherapie",
    icon: ShieldIcon,
    slug: "immuntherapie",
  },
  {
    id: "strahlen",
    name: "Strahlentherapie",
    icon: SunIcon,
    slug: "strahlentherapie",
  },
  {
    id: "chemo",
    name: "Chemotherapie",
    icon: SyringeIcon,
    slug: "chemotherapie",
  },
  { id: "op", name: "Operationen", icon: HospitalIcon, slug: "operationen" },
  {
    id: "target",
    name: "Zielgerichtete Therapie",
    icon: TargetIcon,
    slug: "zielgerichtete-therapie",
  },
  {
    id: "palliativ",
    name: "Palliativmedizin",
    icon: LeafIcon,
    slug: "palliativmedizin",
  },
  {
    id: "radiochemo",
    name: "Radiochemotherapie",
    icon: SunIcon,
    slug: "radiochemotherapie",
  },
  {
    id: "chemoimmun",
    name: "Chemoimmuntherapie",
    icon: ShieldIcon,
    slug: "chemoimmuntherapie",
  },
  {
    id: "ablauf34",
    name: "Typischer Ablauf Stadium III / IV",
    icon: TargetIcon,
    slug: "ablauf-stadium-3-4",
  },
];

export default function InformationenOverview() {
  const navigate = useNavigate();

  const therapies = useMemo(() => THERAPIES, []);

  const handleCardClick = (slug: string) => {
    navigate(`/informationen/${slug}`);
  };

  return (
    <div className="min-h-screen w-full bg-emerald-50 overflow-x-hidden">
      <div
        className="
          mx-auto w-full max-w-screen-xl
          px-4 sm:px-6 lg:px-8
          pt-6 sm:pt-8 lg:pt-10
          pb-10
          [padding-bottom:calc(2.5rem+env(safe-area-inset-bottom))]
        "
      >
        {/* Back */}
        <button
          onClick={() => navigate("/home")}
          className="
            inline-flex items-center gap-2 rounded-xl
            px-2 py-2 text-emerald-950 hover:text-emerald-800
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
          "
          aria-label="Zurück"
        >
          <span className="text-2xl leading-none" aria-hidden>
            ←
          </span>
          <span className="text-base font-medium">Zurück</span>
        </button>

        {/* Headline */}
        <h1 className="mt-5 text-xl font-semibold leading-snug text-emerald-950 sm:mt-6 sm:text-2xl lg:text-3xl">
          Hier finden Sie verständliche Informationen zu verschiedenen
          Therapien.
        </h1>

        {/* Grid */}
        <div className="mt-6 sm:mt-8">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {therapies.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.slug)}
                className="
                  group rounded-3xl bg-white
                  px-4 py-4 sm:px-5 sm:py-5
                  text-center shadow-sm transition
                  hover:shadow-md active:scale-[0.99]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                "
              >
                <div className="mx-auto flex flex-col items-center justify-center">
                  <img
                    src={card.icon}
                    alt=""
                    className="h-10 w-10 sm:h-12 sm:w-12"
                    aria-hidden
                  />

                  <div
                    className="
                      mt-3 text-[15px] font-semibold leading-snug text-emerald-950
                      sm:text-base lg:text-[17px]
                      break-words [hyphens:auto]
                      overflow-hidden
                      [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]
                    "
                  >
                    {card.name}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex w-full justify-end sm:mt-10">
            <button
              onClick={() => navigate("/videos")}
              className="
                inline-flex items-center gap-2
                rounded-full bg-emerald-800
                px-5 py-3 text-base font-semibold text-white shadow-md
                hover:bg-emerald-900 active:scale-[0.99]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
                sm:px-6 sm:text-lg
              "
            >
              <img src={PlayIcon} alt="" className="h-5 w-5" aria-hidden />
              Zu den Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
