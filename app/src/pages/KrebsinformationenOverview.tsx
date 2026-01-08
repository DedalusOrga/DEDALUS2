import { useNavigate } from "react-router-dom";
import StageIcon from "../assets/icons/book.svg"; // später austauschen
import CompareIcon from "../assets/icons/book.svg"; // später austauschen

export default function KrebsinformationenOverview() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "stadien",
      title: "Stadienübersicht + Erklärung",
      icon: StageIcon,
      slug: "stadienuebersicht",
    },
    {
      id: "vergleich",
      title: "Stadium III vs. IV",
      icon: CompareIcon,
      slug: "stadium-vergleich",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-emerald-900 mb-8">
        Allgemeine Krebsinformationen
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(`/informationen/allgemein/${card.slug}`)}
            className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-sm
                       hover:bg-emerald-50 hover:shadow-md transition"
          >
            <img src={card.icon} className="h-10 w-10 mb-4" />
            <span className="text-lg font-semibold text-slate-900 leading-snug">
              {card.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
