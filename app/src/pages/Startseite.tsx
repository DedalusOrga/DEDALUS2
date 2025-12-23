import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import arztIcon from "@/assets/arzt.png";

export default function Startseite() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center bg-emerald-50">
      <div className="flex flex-col md:flex-row items-center justify-between w-full px-10 md:px-20">
        {/* Linker Bereich (Text) */}
        <div className="max-w-xl">
          {/* Überschrift */}
          <h1 className="text-6xl md:text-5xl font-bold text-green-900">
            Willkommen zur
            <br />
            DEDALUS App!
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

        {/* Bild Arzt */}
        <div className="mt-10 md:mt-0">
          <img src={arztIcon} alt="Arzt" className="w-80 md:w-[380px]" />
        </div>
      </div>
    </div>
  );
}
