// app/src/pages/Startseite.tsx
import { Link } from "react-router-dom";
import thoraxImage from "../assets/thx-klinik.jpg";

export default function Startseite() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6 md:px-10">
        <div className="flex w-full flex-col items-center gap-8 md:gap-12">
          {/* Text */}
          <div className="w-full max-w-xl text-center md:text-left">
            <h1 className="text-4xl font-bold leading-tight text-green-900 sm:text-5xl md:text-6xl">
              Willkommen bei
              <br />
              DEDALUS!
            </h1>

            <p className="mt-5 text-base text-green-900 sm:text-lg md:mt-8">
              Hier können Sie sich registrieren, um die Web-App zu nutzen.
            </p>

            <div className="mt-7 md:mt-10">
              <Link
                to="/Login"
                className="inline-flex w-full items-center justify-center rounded-full bg-green-900 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-95 sm:w-auto sm:text-lg"
              >
                Anmelden
              </Link>
            </div>
          </div>

          {/* Image – immer unten */}
          <div className="flex w-full flex-col items-center">
            <div className="h-[260px] w-[260px] overflow-hidden rounded-full shadow-xl sm:h-[360px] sm:w-[360px] md:h-[520px] md:w-[520px]">
              <img
                src={thoraxImage}
                alt="Thoraxklinik"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="mt-3 max-w-sm text-center text-xs text-emerald-900/70">
              © Krebsinformationsdienst, Deutsches Krebsforschungszentrum,
              Fotograf Tobias Schwerdt, Wiesenbach
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
