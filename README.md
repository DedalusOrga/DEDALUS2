# DEDALUS – Patienteninformations-Web-App

**Projektteam:** InnoHealth Solutions  
**Technologien:** React 19 · TypeScript · Vite · Tailwind CSS · Supabase (EU-Hosting)  
**Ziel:** Entwicklung einer barrierearmen, verständlichen Informationsplattform für Patient:innen des Universitätsklinikums Heidelberg.  
**Kontext:** Hochschul-/Klinikprojekt im Rahmen von AWP 2025

---

## Projektüberblick

DEDALUS 2 ist eine moderne Web-App zur einfachen Bereitstellung medizinischer Informationen in barrierearmer Sprache.  
Die Anwendung basiert auf einem React-Frontend, nutzt Tailwind CSS für responsives Design und Supabase als Backend-Plattform (Datenbank, Auth, Storage).

---

## Verzeichnisstruktur

```
DEDALUS2/
├─ .github/
│  └─ workflows/        → CI/CD-Pipelines (Build, Test, Deploy)
│
├─ app/
│  └─ src/
│     ├─ assets/        → Statische Ressourcen (Icons, Bilder, Medien)
│
│     ├─ components/    → Wiederverwendbare UI-Komponenten
│     │  └─ admin/      → Admin-spezifische Layouts, Guards & Module
│
│     ├─ pages/         → Routen & Seiten der Anwendung
│     │  ├─ admin/      → Admin-Oberflächen (Inhalte, Glossar, Entscheidungsbäume, Fragen)
│     │  ├─ Entscheidungen/
│     │  │   └─ Frageboegen/ → Entscheidungslogik & Fragebogen-Flows
│     │  └─ Informationen/  → Medizinische & erklärende Inhalte für Patient:innen
│
│     ├─ glossary/      → Glossar-Logik (Markdown-Erweiterung, Kontext, Rendering)
│
│     ├─ data/          → Statische oder semistatische Daten (z. B. Glossarbegriffe)
│
│     ├─ hooks/         → Custom React Hooks (Auth, Rollen, Content-Binding, TTS)
│
│     ├─ infrastructure/
│     │  ├─ api/        → API-nahe Logik (z. B. Login-Handling)
│     │  └─ supabase/   → Supabase-Client & Datenbankanbindung
│
│     ├─ types/         → Zentrale TypeScript-Typen & Interfaces
│
│     ├─ utils/         → Kleine Hilfsfunktionen & Konstanten
│
│     ├─ App.tsx        → Zentrales Routing & App-Setup
│     └─ main.tsx       → Einstiegspunkt (React + Vite)
│
├─ test/
│  ├─ mocks/            → Test-Mocks (z. B. File-Uploads, externe Abhängigkeiten)
│  ├─ *.test.tsx        → UI- & Seiten-Tests (Auth, Navigation, Admin)
│  └─ jest.setup.ts    → Globale Testkonfiguration
│
├─ node_modules/        → Abhängigkeiten (auto-generiert)
│
├─ .env                 → Lokale Umgebungsvariablen
├─ .env.example         → Vorlage für Environment-Setup
│
├─ package.json         → Abhängigkeiten & Skripte
├─ vite.config.ts       → Build- & Dev-Server-Konfiguration
├─ tailwind.config.js   → Styling-Konfiguration
├─ tsconfig.json        → TypeScript-Setup
└─ README.md            → Projektübersicht & Einstieg
```

---

## Setup & Installation

### 1️⃣ Repository clonen

```bash
git clone https://github.com/Braendli98/DEDALUS2.git
cd dedalus2-webapp
```

### 2️⃣ Node.js & npm prüfen

```bash
node -v
npm -v
```

Empfohlen: Node 22 LTS +

### 3️⃣ Abhängigkeiten installieren

```bash
npm install
```

### 4️⃣ Environment anlegen

Kopiere die Beispiel-Datei und trage deine Supabase-Keys ein:

```bash
cp .env.example .env
```

`.env`

```
VITE_SUPABASE_URL=https://<projekt>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 5️⃣ Entwicklungsserver starten

```bash
npm run dev
```

App läuft unter: [http://localhost:5173](http://localhost:5173)

---

## Technologien & Tools

| Bereich        | Technologie        | Zweck                                 |
| -------------- | ------------------ | ------------------------------------- |
| **Frontend**   | React + TypeScript | Benutzeroberfläche & Routing          |
| **Styling**    | Tailwind CSS       | Barrierearmes, responsives Design     |
| **Build Tool** | Vite               | Dev-Server & Build-Pipeline           |
| **Backend**    | Supabase           | Authentifizierung, Datenbank, Storage |
| **CI/CD**      | GitHub Actions     | Automatischer Build + Lint/Test       |
| **Hosting**    | Vercel / Supabase  | Frontend + Datenhaltung               |

---

## Environment & Sicherheit

| Datei          | Zweck                                | Commit ins Repo |
| -------------- | ------------------------------------ | --------------- |
| `.env`         | Lokale Keys & Konfiguration          | ❌ Nein         |
| `.env.example` | Platzhalter für Setup                | ✅ Ja           |
| `.gitignore`   | schützt `.env` und temporäre Dateien | ✅ Ja           |

---

## Workflows & Abnahme

- **Branch-Strategie:**  
  `main` (Release) · `develop` (Integration) · `feature/*` (Entwicklung)
- **CI:**  
  GitHub Actions prüfen Build, Lint & Test bei jedem Push.

---

## Kontakt

**InnoHealth Solutions – Projektteam DEDALUS 2**  
Universität / Hochschule: HKA  
Betreuer: _[wird ergänzt]_  
E-Mail: _[wird ergänzt]_
