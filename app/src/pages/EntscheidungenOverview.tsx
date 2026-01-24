import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import ChatIcon from "../assets/token_chat.svg";
import SignpostIcon from "../assets/signpost.svg";
import ClipboardIcon from "../assets/clipboard.svg";
import EntscheidungenImage from "../assets/entscheidungen.jpg";

type Decision = {
  id: string;
  name: string;
  icon: string;
  slug: string;
};

const DECISION: Decision[] = [
    {
      id: "arzt",
      name: "Fragen für das Arztgespräch",
      icon: ChatIcon,
      slug: "arztgespraech",
    },
    {
      id: "planung",
      name: "Planung und Entscheidung",
      icon: SignpostIcon,
      slug: "planung",
    },
    {
      id: "frageboegen",
      name: "Fragebögen zu Entscheidungen",
      icon: ClipboardIcon,
      slug: "frageboegen",
    },
  ];

  export default function InformationenOverview() {
    const navigate = useNavigate();
  
    const decisions = useMemo(() => DECISION, []);
  
    const handleCardClick = (slug: string) => {
      navigate(`/entscheidungen/${slug}`);
    };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
      {/* Titel */}
      <h1 className="mb-8 text-2xl font-extrabold text-emerald-900 sm:text-3xl md:text-4xl md:mb-10">
        Entscheidungen
      </h1>

      {/* Grid */}
          <div className="mt-6 sm:mt-8">
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {decisions.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.slug)}
                  className="
                  group flex flex-col items-start rounded-3xl bg-white
                  p-4 sm:p-5
                  text-left shadow-sm transition
                  hover:shadow-md active:scale-[0.99]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                "
                >
                  <div
                    className={`
                      flex items-center justify-center
                      ${card.id}
                    `}
                  >
                    <img
                      src={card.icon}
                      alt=""
                      className="h-10 w-10 object-contain sm:h-12 sm:w-12"
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
                </button>
              ))}
            </div>
          </div>

      {/* Bild unter den Karten */}
      <div className="mt-12 flex justify-center">
        <img
          src={EntscheidungenImage}
          alt="Entscheidungen"
          className="w-full max-w-4xl rounded-3xl shadow-sm"
        />
      </div>
    </div>
  );
}
