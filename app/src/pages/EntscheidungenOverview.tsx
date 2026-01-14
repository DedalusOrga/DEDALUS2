import { useNavigate } from "react-router-dom";
import ChatIcon from "../assets/token_chat.svg";
import SignpostIcon from "../assets/signpost.svg";
import ClipboardIcon from "../assets/clipboard.svg";

export default function EntscheidungenOverview() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "arzt",
      title: "Fragen für das Arztgespräch",
      icon: ChatIcon,
      path: "/entscheidungen/arztgespraech",
    },
    {
      id: "planung",
      title: "Planung und Entscheidung",
      icon: SignpostIcon,
      path: "/entscheidungen/planung",
    },
    {
      id: "frageboegen",
      title: "Fragebögen zu Entscheidungen",
      icon: ClipboardIcon,
      path: "/entscheidungen/frageboegen",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
      {/* Titel – wird auf größeren Displays größer */}
      <h1 className="mb-8 text-2xl font-extrabold text-emerald-900 sm:text-3xl md:text-4xl md:mb-10">
        Entscheidungen
      </h1>
      {/* Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-3xl shadow-sm h-64 flex flex-col items-center justify-center
                         hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {/* Icon */}
            <img src={card.icon} alt={card.title} className="w-12 h-12 mb-4" />

            {/* Titel */}
            <div className="text-lg font-medium text-emerald-900 text-center px-4">
              {card.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
