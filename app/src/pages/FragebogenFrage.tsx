import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Mapping: technische ID → sichtbarer Fragebogen-Titel
const questionnaireMeta: Record<string, { number: string; title: string }> = {
  fb1: {
    number: "Fragebogen 1",
    title: "Was möchte ich mit der Behandlung erreichen?",
  },
  fb2: {
    number: "Fragebogen 2",
    title: "Wie möchte ich bei Entscheidungen mitwirken?",
  },
  fb3: {
    number: "Fragebogen 3",
    title: "Was beeinflusst meine Entscheidungen?",
  },
  fb4: {
    number: "Fragebogen 4",
    title: "Wie werden Entscheidungen bei Krankheiten getroffen?",
  },
  fb5: {
    number: "Fragebogen 5",
    title: "Was ist mir während der Behandlungsphase wichtig?",
  },
};

const dummyQuestions = [
  {
    id: 1,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    options: ["Antwort 1", "Antwort 2", "Antwort 3", "Antwort 4"]
  },
  {
    id: 2,
    text: "Wie möchte ich bei Entscheidungen mitwirken?",
    options: ["Antwort 1", "Antwort 2", "Antwort 3", "Antwort 4"]
  },
  {
    id: 3,
    text: "Was beeinflusst meine Entscheidungen?",
    options: ["Antwort 1", "Antwort 2", "Antwort 3", "Antwort 4"]
  }
];


export default function FragebogenFrage() {
  const { id } = useParams();
  const meta = questionnaireMeta[id!] ?? { number: "Fragebogen", title: "" };

  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);

  const question = dummyQuestions[current];
  const lastQuestion = current === dummyQuestions.length - 1;

  const nr = id?.replace("fb", "");

  const next = () => {
    if (lastQuestion) {
      navigate(`/entscheidungen/fragebogen/${id}/fertig`);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const back = () => {
    if (current === 0) {
      navigate("/entscheidungen/frageboegen-entscheidung");
    } else {
      setCurrent((c) => c - 1);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">

      {/* Zurück */}
      <button 
        onClick={back}
        className="flex items-center text-emerald-900 mb-6 cursor-pointer"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>
    
      {/* Fragebogen-Nummer */}
      <h1 className="text-emerald-900 text-3xl font-semibold mb-2">
        {meta.number}
      </h1>

      {/* Titel */}
      <h1 className="text-2xl md:text-2xl text-emerald-900 mb-2">
        {meta.title}
      </h1>

      <p className="text-emerald-800 mb-6 text-lg">
        Frage {current + 1} von {dummyQuestions.length}
      </p>

      {/* Frage-Karte */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <p className="text-lg text-emerald-900 mb-6 leading-relaxed">
          {question.text}
        </p>

        {/* Antwortoptionen – NICHT funktional */}
        <div className="flex flex-col gap-4">
          {question.options.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input type="radio" disabled />
              <span className="text-emerald-900">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Weiter / Abschließen */}
        <div className="flex justify-end">
          {lastQuestion ? (
            // Abschluss-Button (gefüllt)
            <button
              onClick={next}
              className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full text-base font-semibold"
            >
              Fragebogen abschließen
            </button>
          ) : (
            // Weiter-Button (nur Text, kein Hintergrund)
            <button
              onClick={next}
              className="text-emerald-900 hover:text-emerald-700 text-lg font-medium flex items-center gap-2 pr-2"
            >
              Weiter →
            </button>
          )}
        </div>
    </div>
  );
}
