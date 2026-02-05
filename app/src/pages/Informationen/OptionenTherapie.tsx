import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import SunIcon from "../../assets/sun.svg";
import SyringeIcon from "../../assets/syringe.svg";
import TargetIcon from "../../assets/target.svg";
import LeafIcon from "../../assets/leaf.svg";
import sunAndSyringeIcon from "../../assets/sunAndSyringe.svg";
import VirusAndSyringeIcon from "../../assets/virusAndSyringe.svg";
import twoSyringesIcon from "../../assets/twoSyringes.svg";
import arrowIcon from "../../assets/arrow.svg";

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
    icon: VirusAndSyringeIcon,
    slug: "immuntherapie",
  },
  {
    id: "chemo",
    name: "Chemotherapie",
    icon: SyringeIcon,
    slug: "chemotherapie",
  },
  {
    id: "strahlen",
    name: "Strahlentherapie",
    icon: SunIcon,
    slug: "strahlentherapie",
  },
  {
    id: "radiochemo",
    name: "Radiochemotherapie",
    icon: sunAndSyringeIcon,
    slug: "radiochemotherapie",
  },
  {
    id: "chemoimmun",
    name: "Chemoimmuntherapie",
    icon: twoSyringesIcon,
    slug: "chemoimmuntherapie",
  },
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
    id: "ablauf34",
    name: "Typischer Ablauf Stadium III / IV",
    icon: arrowIcon,
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
          onClick={() => navigate(-1)}
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
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-extrabold text-emerald-900 mb-10">
            Therapieoptionen
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
                    <div
                      className={`
                          flex items-center justify-center mx-auto
                          ${
                            card.id === "chemoimmun" || card.id === "radiochemo"
                              ? "h-16 w-16 sm:h-20 sm:w-20"
                              : "h-14 w-14"
                          }
                        `}
                    >
                      <img
                        src={card.icon}
                        alt=""
                        className="h-full w-full object-contain"
                        aria-hidden
                      />
                    </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
