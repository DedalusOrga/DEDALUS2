# DEDALUS 2 – Patienteninformations-Web-App

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
├─ app/                    → React-Frontend (Codebasis)
│   └─ src/
│       ├─ components/     → UI-Bausteine
│       ├─ pages/          → Seiten & Routen
│       ├─ assets/         → Bilder, Icons, Fonts
│       ├─ hooks/          → Eigene React-Hooks
│       ├─ config/         → Supabase-Client, API-Konfiguration
│       ├─ index.css       → Tailwind-Setup
│       ├─ main.tsx        → App-Startpunkt
│       └─ App.tsx         → Haupteinstieg der App
│
├─ infrastructure/          → Technische Infrastruktur
│   ├─ supabase/            → Verbindung, Skripte, SQL-Schema, Supabase-Client
│   └─ deploy/              → Deployment-/Build-Skripte
│   
├─ docs/                    → Projektdokumentation
│   ├─ kunden/              → Dokumente für Auftraggeber
│   └─ it/                  → Technische Doku, Übergabe, QA
│
├─ public/                  → Statische Dateien (index.html, Logo, PDFs)
│
├─ .github/                 → GitHub Workflows (CI/CD)
│   └─ workflows/           → z. B. ci.yml / deploy.yml
│
├─ .env                     → Lokale Umgebungsvariablen (nicht committen)
├─ .env.example             → Muster-Datei für Teammitglieder
├─ .gitignore               → Ignorierte Dateien (node_modules, .env, etc.)
├─ package.json             → Projekt-Abhängigkeiten & Skripte
├─ vite.config.ts           → Vite-Konfiguration
├─ tailwind.config.js       → Tailwind-Konfiguration
├─ postcss.config.js        → PostCSS-Pipeline
├─ tsconfig.json            → TypeScript-Einstellungen
└─ README.md                → Diese Datei 
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

| Bereich | Technologie | Zweck |
|----------|-------------|--------|
| **Frontend** | React + TypeScript | Benutzeroberfläche & Routing |
| **Styling** | Tailwind CSS | Barrierearmes, responsives Design |
| **Build Tool** | Vite | Dev-Server & Build-Pipeline |
| **Backend** | Supabase | Authentifizierung, Datenbank, Storage |
| **CI/CD** | GitHub Actions | Automatischer Build + Lint/Test |
| **Hosting** | Vercel / Supabase | Frontend + Datenhaltung |

---

## Environment & Sicherheit

| Datei | Zweck | Commit ins Repo |
|--------|--------|----------------|
| `.env` | Lokale Keys & Konfiguration | ❌ Nein |
| `.env.example` | Platzhalter für Setup | ✅ Ja |
| `.gitignore` | schützt `.env` und temporäre Dateien | ✅ Ja |

---

## Workflows & Abnahme

- **Branch-Strategie:**  
  `main` (Release) · `develop` (Integration) · `feature/*` (Entwicklung)  
- **CI:**  
  GitHub Actions prüfen Build, Lint & Test bei jedem Push.  
- **Dokumentation:**  
  Detaillierte Kundendoku & technische Übergabe unter `docs/`.  
- **Abnahme:**  
  Kriterien & Checklisten in `docs/it/qa/`.

---

## Kontakt

**InnoHealth Solutions – Projektteam DEDALUS 2**  
Universität / Hochschule: HKA  
Betreuer: *[wird ergänzt]*  
E-Mail: *[wird ergänzt]*  


## Supabase

User:
user@test.com

Passwort:
1234