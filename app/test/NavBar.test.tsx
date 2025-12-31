jest.mock("../src/infrastructure/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      })),
    })),
  },
}));

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../src/components/NavBar"; // ggf. anpassen

// LogoutButton mocken (damit keine Auth-Logik/Side Effects)
jest.mock("../src/components/LogoutButton", () => ({
  __esModule: true,
  default: () => <button>Logout</button>,
}));

function renderNav(initialPath = "/informationen-uebersicht") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavBar />
    </MemoryRouter>,
  );
}

describe("NavBar", () => {
  it("rendert die Hauptnavigation mit Tabs und Logout", () => {
    renderNav();

    // Navigation landmark
    expect(screen.getByLabelText("Hauptnavigation")).toBeInTheDocument();

    // Tabs vorhanden
    expect(
      screen.getByRole("link", { name: "Informationen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Entscheidungen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Bedienhilfe" }),
    ).toBeInTheDocument();

    // LogoutButton mock vorhanden
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("setzt den aktiven Tab korrekt (Informationen)", () => {
    renderNav("/informationen-uebersicht");

    const info = screen.getByRole("link", { name: "Informationen" });
    const ents = screen.getByRole("link", { name: "Entscheidungen" });
    const help = screen.getByRole("link", { name: "Bedienhilfe" });

    // react-router setzt aria-current="page" auf aktiven NavLink
    expect(info).toHaveAttribute("aria-current", "page");
    expect(ents).not.toHaveAttribute("aria-current");
    expect(help).not.toHaveAttribute("aria-current");

    // Optional: auch Classnames prüfen (nicht zu streng, aber ok)
    expect(info.className).toContain("text-emerald-700");
    expect(info.className).toContain("border-emerald-600");
  });

  it("setzt den aktiven Tab korrekt (Entscheidungen)", () => {
    renderNav("/entscheidungen");

    const ents = screen.getByRole("link", { name: "Entscheidungen" });
    expect(ents).toHaveAttribute("aria-current", "page");
    expect(ents.className).toContain("text-emerald-700");
  });

  it("setzt den aktiven Tab korrekt (Bedienhilfe)", () => {
    renderNav("/bedienhilfe");

    const help = screen.getByRole("link", { name: "Bedienhilfe" });
    expect(help).toHaveAttribute("aria-current", "page");
    expect(help.className).toContain("text-emerald-700");
  });

  it("hat die korrekten Ziel-URLs", () => {
    renderNav();

    expect(screen.getByRole("link", { name: "Informationen" })).toHaveAttribute(
      "href",
      "/informationen-uebersicht",
    );
    expect(
      screen.getByRole("link", { name: "Entscheidungen" }),
    ).toHaveAttribute("href", "/entscheidungen");
    expect(screen.getByRole("link", { name: "Bedienhilfe" })).toHaveAttribute(
      "href",
      "/bedienhilfe",
    );
  });
});
