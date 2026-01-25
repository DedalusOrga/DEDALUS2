import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import VectorIcon from "../../../assets/vector.svg";

export default function FragebogenFertig() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      {/* Zurück */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-emerald-900 mb-10"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>

      {/* Danke-Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-md p-10 text-center">
        <img
          src={VectorIcon}
          alt="Success Icon"
          className="w-10 h-10 mx-auto mb-6"
        />

        <h1 className="text-3xl font-semibold text-emerald-900 mb-4">
          Vielen Dank!
        </h1>

        <p className="text-emerald-900 mb-10 leading-relaxed">
          Sie haben alle Fragen beantwortet. Ihre Antworten wurden gespeichert.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          {/* Zur Übersicht */}
          <button
            onClick={() => navigate("/entscheidungen/frageboegen")}
            className="bg-emerald-100 text-emerald-900 px-6 py-3 rounded-full font-semibold hover:bg-emerald-200"
          >
            Zur Übersicht
          </button>

          {/* Ergebnisse */}
          <button
            onClick={() =>
              navigate(`/entscheidungen/fragebogen/${id}/ergebnis`)
            }
            className="bg-emerald-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-800"
          >
            Ergebnisse ansehen
          </button>
        </div>
      </div>
    </div>
  );
}
