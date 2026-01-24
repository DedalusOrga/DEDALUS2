import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

type Questionnaire = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  is_active: boolean;
};

export default function FrageboegenEntscheidung() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("questionnaires")
        .select("id, code, title, description, is_active")
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) setError(error.message);
      setItems(data ?? []);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={() => navigate("/entscheidungen")}
          className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        {loading && <p className="text-emerald-900">Lade...</p>}
        {error && <p className="text-red-700">Fehler: {error}</p>}

        <div className="flex flex-wrap justify-center gap-6">
          {items.map((fb) => (
            <button
              key={fb.id}
              onClick={() => navigate(`/entscheidungen/fragebogen/${fb.code}`)}
              className="bg-white rounded-3xl shadow-sm h-48 w-full sm:w-80 
                         flex flex-col items-center justify-center
                         hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
            >
              <div className="text-xl font-semibold text-emerald-900 mb-3">
                {fb.title}
              </div>
              <div className="text-emerald-900 text-lg px-6 leading-snug">
                {fb.description ?? ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
