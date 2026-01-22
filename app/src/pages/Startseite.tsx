import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import thoraxImage from "../assets/thx-klinik.jpg";

export default function Startseite() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center bg-emerald-50">
      <div className="flex flex-col md:flex-row items-center justify-between w-full px-10 md:px-20">
        {/* Linker Bereich (Text) */}
        <div className="max-w-xl">
          {/* Überschrift */}
          <h1 className="text-6xl md:text-5xl font-bold text-green-900">
            Willkommen bei
            <br />
            DEDALUS!
          </h1>

          {/* Beschreibung */}
          <p className="text-lg text-green-900 mt-12">
            Hier können Sie sich registrieren, um die Web-App zu nutzen.
          </p>

          {/* ➜ Der Button führt zu /register */}
          <Link
            to="/Login"
            className="inline-block bg-green-900 text-white px-10 py-3 rounded-full text-lg font-semibold mt-10"
          >
            Anmelden
          </Link>
        </div>
    
        {/* RECHTE SEITE */}
      <div className="w-[520px] h-[520px] rounded-full overflow-hidden shadow-xl flex-shrink-0">
        <img
          src={thoraxImage}
          alt="Thoraxklinik"
          className="w-full h-full object-cover"
        />
      </div>
      </div>
    </div>
  );
}
