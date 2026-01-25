import { useNavigate } from "react-router-dom";
import AerzteImage from "../assets/Aerzte.jpg";

export default function PlanungOverview() {
  const navigate = useNavigate();

  const items = [
    { slug: "entscheidungsfindung", title: "Infos zur Entscheidungsfindung" },
    { slug: "lebensplanung", title: "Planung für das Lebensende" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Zurück */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-emerald-900 mb-8 hover:text-emerald-700"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>

      {/* Titel + Einleitung */}
      <h1 className="text-3xl font-bold text-emerald-900 mb-10">
        Planung und Entscheidung
      </h1>

      {/* Karten */}
      <div className="grid gap-8 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.slug}
            onClick={() => navigate(`/entscheidungen/planung/${item.slug}`)}
            className="rounded-2xl p-8 shadow-sm bg-white hover:shadow-md hover:bg-emerald-50 transition"
          >
            <div className="text-xl font-semibold text-emerald-900 mb-3">
              {item.title}
            </div>
          </button>
        ))}
      </div>
      {/* Bild unter den Karten */}
      <div className="mt-12 flex justify-center">
        <img
          src={AerzteImage}
          alt="Entscheidungen"
          className="w-full max-w-4xl rounded-3xl shadow-sm"
        />
      </div>
      <p className="mt-2 text-xs text-center text-emerald-900 opacity-70">
        © Krebsinformationsdienst, Deutsches Krebsforschungszentrum, Fotograf
        Tobias Schwerdt, Wiesenbach
      </p>
    </div>
  );
}
